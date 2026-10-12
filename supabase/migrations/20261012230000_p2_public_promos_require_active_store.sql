-- P2 visibility gate: a disabled store must not expose or service its promos.
-- Deliberately preserve admin visibility, grants, privileges and all existing data.
-- Before deployment: validate against an isolated Supabase branch (do not apply blind).

do $policy_guard$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promo_codes'
      and policyname = 'Anonymous read live promos'
      and cmd = 'SELECT' and 'anon' = any(roles)
  ) or not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promo_codes'
      and policyname = 'Readable promos'
      and cmd = 'SELECT' and 'authenticated' = any(roles)
  ) then
    raise exception 'P2 policy topology mismatch: abort without changing production permissions';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promo_codes'
      and policyname not in (
        'Anonymous read live promos', 'Readable promos',
        'Admins update promos', 'Admins delete promos',
        'Submit or admin insert promos'
      )
  ) then
    raise exception 'P2 unexpected extra promo policy: review before changing visibility';
  end if;
end;
$policy_guard$;

alter policy "Anonymous read live promos" on public.promo_codes
  using (
    approved = true and is_active = true
    and (expires_at is null or expires_at > now())
    and exists (
      select 1 from public.stores s
      where s.id = store_id and s.is_active = true
    )
  );

alter policy "Readable promos" on public.promo_codes
  using (
    (
      approved = true and is_active = true
      and (expires_at is null or expires_at > now())
      and exists (
        select 1 from public.stores s
        where s.id = store_id and s.is_active = true
      )
    )
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

create or replace function public.record_promo_click(
  p_promo_id uuid, p_fingerprint text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $click$
declare
  v_destination text;
begin
  select pc.destination_url into v_destination
  from public.promo_codes pc
  join public.stores s on s.id = pc.store_id and s.is_active = true
  where pc.id = p_promo_id
    and pc.approved = true
    and pc.is_active = true
    and (pc.expires_at is null or pc.expires_at > now());

  if v_destination is null then
    return null;
  end if;

  insert into public.promo_clicks (promo_id, fingerprint)
  values (p_promo_id, nullif(p_fingerprint, ''));

  update public.promo_codes
  set click_count = click_count + 1, updated_at = now()
  where id = p_promo_id;

  return v_destination;
end;
$click$;

create or replace function public.record_promo_vote(
  p_promo_id uuid, p_vote_type text, p_fingerprint text
)
returns table(success_rate integer, worked integer, failed integer)
language plpgsql
security definer
set search_path = ''
as $vote$
declare
  v_rows integer := 0;
begin
  if p_vote_type not in ('worked', 'failed') then
    raise exception 'invalid vote type';
  end if;

  if p_fingerprint is null
     or char_length(p_fingerprint) < 8
     or char_length(p_fingerprint) > 200 then
    raise exception 'invalid fingerprint';
  end if;

  if not exists (
    select 1 from public.promo_codes pc
    join public.stores s on s.id = pc.store_id and s.is_active = true
    where pc.id = p_promo_id
      and pc.approved = true
      and pc.is_active = true
      and (pc.expires_at is null or pc.expires_at > now())
  ) then
    raise exception 'promo not available';
  end if;

  insert into public.promo_votes (promo_id, vote_type, fingerprint)
  values (p_promo_id, p_vote_type, p_fingerprint)
  on conflict (promo_id, fingerprint) do nothing;

  get diagnostics v_rows = row_count;

  if v_rows = 1 then
    update public.promo_codes
    set worked_count = worked_count
          + case when p_vote_type = 'worked' then 1 else 0 end,
        failed_count = failed_count
          + case when p_vote_type = 'failed' then 1 else 0 end,
        updated_at = now()
    where id = p_promo_id;
  end if;

  return query
  select
    case
      when pc.worked_count + pc.failed_count = 0 then 0
      else round(
        (pc.worked_count::numeric * 100)
        / (pc.worked_count + pc.failed_count)
      )::integer
    end,
    pc.worked_count,
    pc.failed_count
  from public.promo_codes pc
  where pc.id = p_promo_id;
end;
$vote$;

-- CREATE OR REPLACE preserves the existing function ACLs; do not grant new roles.
