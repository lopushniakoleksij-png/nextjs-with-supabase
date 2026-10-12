-- Read-only P2 production preflight. This file performs NO writes.
-- Execute on production only for read-only inspection, before an authorized release.
with
  promo_policies as (
    select policyname, cmd, roles, qual
    from pg_policies
    where schemaname='public' and tablename='promo_codes'
  ),
  tracking_rpcs as (
    select p.proname, p.prosecdef as security_definer, pg_get_functiondef(p.oid) as body
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname in ('record_promo_click', 'record_promo_vote')
  )
select
  (select count(*) from public.profiles where role='admin') as administrator_count,
  (select count(*) from public.stores) as store_count,
  (select count(*) from public.promo_codes) as promo_count,
  (select count(*) = 5 from promo_policies) as expected_five_promo_policies,
  (select count(*) = 1 from promo_policies
   where policyname='Anonymous read live promos'
     and cmd='SELECT' and 'anon'=any(roles)) as anon_select_policy_expected,
  (select count(*) = 1 from promo_policies
   where policyname='Readable promos'
     and cmd='SELECT' and 'authenticated'=any(roles)) as authenticated_select_policy_expected,
  (select count(*) = 2 from promo_policies
   where policyname in ('Anonymous read live promos', 'Readable promos')
     and qual !~* 'stores') as before_p2_policy_state,
  (select count(*) = 2 from tracking_rpcs
   where security_definer
     and body not ilike '%join public.stores s%') as before_p2_rpc_state,
  has_function_privilege(
    'anon','public.record_promo_click(uuid,text)','EXECUTE'
  ) as anon_click_execute_present,
  has_function_privilege(
    'anon','public.record_promo_vote(uuid,text,text)','EXECUTE'
  ) as anon_vote_execute_present,
  (select count(*) = 6
   from supabase_migrations.schema_migrations
   where version in (
     '20261006101203','20261006101233','20261006101302',
     '20261007143339','20261007150716','20261008041424'
   )) as recorded_history_present;
