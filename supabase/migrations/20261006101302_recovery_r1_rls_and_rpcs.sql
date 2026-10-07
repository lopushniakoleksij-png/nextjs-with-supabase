alter table public.stores enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_votes enable row level security;
alter table public.promo_clicks enable row level security;

drop policy if exists "Public can read active stores" on public.stores;
create policy "Public can read active stores"
on public.stores
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins manage stores" on public.stores;
create policy "Admins manage stores"
on public.stores
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

drop policy if exists "Public can read live promos" on public.promo_codes;
create policy "Public can read live promos"
on public.promo_codes
for select
to anon, authenticated
using (
  approved = true
  and is_active = true
  and (expires_at is null or expires_at > now())
);

drop policy if exists "Authenticated users can submit promos"
on public.promo_codes;
create policy "Authenticated users can submit promos"
on public.promo_codes
for insert
to authenticated
with check (
  submitted_by = (select auth.uid())
  and approved = false
);

drop policy if exists "Admins manage promos" on public.promo_codes;
create policy "Admins manage promos"
on public.promo_codes
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

revoke all on table public.stores from anon, authenticated;
grant select (id, slug, name, website_url, is_active, created_at, updated_at)
on table public.stores to anon, authenticated;
grant insert, update, delete on table public.stores to authenticated;

revoke all on table public.promo_codes from anon, authenticated;
grant select (
  id, store_id, code, title, description, expires_at, approved, is_active,
  click_count, worked_count, failed_count, created_at, updated_at
) on table public.promo_codes to anon, authenticated;
grant insert (
  store_id, code, title, description, destination_url, expires_at, submitted_by
) on table public.promo_codes to authenticated;
grant update, delete on table public.promo_codes to authenticated;

revoke all on table public.promo_votes from anon, authenticated;
revoke all on table public.promo_clicks from anon, authenticated;

create or replace function public.record_promo_vote(
  p_promo_id uuid,
  p_vote_type text,
  p_fingerprint text
)
returns table(success_rate integer, worked integer, failed integer)
language plpgsql
security definer
set search_path = ''
as $$
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
    select 1
    from public.promo_codes pc
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
$$;

revoke all on function public.record_promo_vote(uuid, text, text) from public;
grant execute on function public.record_promo_vote(uuid, text, text)
to anon, authenticated;

create or replace function public.record_promo_click(
  p_promo_id uuid,
  p_fingerprint text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_destination text;
begin
  select pc.destination_url
  into v_destination
  from public.promo_codes pc
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
  set click_count = click_count + 1,
      updated_at = now()
  where id = p_promo_id;

  return v_destination;
end;
$$;

revoke all on function public.record_promo_click(uuid, text) from public;
grant execute on function public.record_promo_click(uuid, text)
to anon, authenticated;
