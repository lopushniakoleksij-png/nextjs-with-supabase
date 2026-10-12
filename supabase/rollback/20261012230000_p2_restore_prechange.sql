-- P2 EMERGENCY ROLLBACK — historical production behavior, never automatic.
-- Restores the exact pre-P2 policies and SECURITY DEFINER function definitions.
-- WARNING: Re-enables previously known disabled-store visibility gap.
-- Preferred incident mitigation: disable affected promo records, not rollback.
-- Review deployment and maintenance window before using on production.
-- This file is NOT a normal forward migration and is NOT applied by CI to prod.
begin;
set local lock_timeout = '5s';

do $p2_rollback_guard$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promo_codes'
      and policyname = 'Anonymous read live promos' and cmd = 'SELECT'
      and 'anon' = any(roles)
      and qual ~* 'stores'
  ) or not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promo_codes'
      and policyname = 'Readable promos' and cmd = 'SELECT'
      and 'authenticated' = any(roles)
      and qual ~* 'stores'
  ) then
    raise exception 'P2 rollback stopped: policy does not match active-store version';
  end if;
  if not exists (
    select 1 from pg_proc
    where oid = 'public.record_promo_click(uuid,text)'::regprocedure
      and pg_get_functiondef(oid) ilike '%join public.stores s%'
  ) or not exists (
    select 1 from pg_proc
    where oid = 'public.record_promo_vote(uuid,text,text)'::regprocedure
      and pg_get_functiondef(oid) ilike '%join public.stores s%'
  ) then
    raise exception 'P2 rollback stopped: function body does not match active-store version';
  end if;
end;
$p2_rollback_guard$;

alter policy "Anonymous read live promos" on public.promo_codes
using (
  approved = true and is_active = true
  and (expires_at is null or expires_at > now())
);

alter policy "Readable promos" on public.promo_codes
using (
  (
    approved = true and is_active = true
    and (expires_at is null or expires_at > now())
  )
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

-- Exact functions as recorded from production BEFORE the P2 migration.
CREATE OR REPLACE FUNCTION public.record_promo_click(p_promo_id uuid, p_fingerprint text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.record_promo_vote(p_promo_id uuid, p_vote_type text, p_fingerprint text)
 RETURNS TABLE(success_rate integer, worked integer, failed integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    set worked_count = worked_count + case when p_vote_type = 'worked' then 1 else 0 end,
        failed_count = failed_count + case when p_vote_type = 'failed' then 1 else 0 end,
        updated_at = now()
    where id = p_promo_id;
  end if;

  return query
  select
    case
      when pc.worked_count + pc.failed_count = 0 then 0
      else round((pc.worked_count::numeric * 100) / (pc.worked_count + pc.failed_count))::integer
    end,
    pc.worked_count,
    pc.failed_count
  from public.promo_codes pc
  where pc.id = p_promo_id;
end;
$function$;

commit;
