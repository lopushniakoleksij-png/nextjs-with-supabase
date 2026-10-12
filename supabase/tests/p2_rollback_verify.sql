-- CI-only verification of *historical* pre-P2 rollback behavior.
-- Uses disposable Postgres after p2_history_replay; do not execute on production.
do $verify$
declare
  v_count integer;
begin
  select count(*) into v_count from pg_policies
  where schemaname='public' and tablename='promo_codes'
    and policyname in ('Anonymous read live promos','Readable promos')
    and qual !~* 'stores';
  if v_count <> 2 then
    raise exception 'ROLLBACK FAIL: public promo policies did not return to pre-P2 form';
  end if;

  select count(*) into v_count
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname in ('record_promo_click','record_promo_vote')
    and pg_get_functiondef(p.oid) not ilike '%join public.stores s%';
  if v_count <> 2 then
    raise exception 'ROLLBACK FAIL: click/vote RPCs did not return to pre-P2 form';
  end if;

  if not has_function_privilege(
    'anon','public.record_promo_click(uuid,text)','EXECUTE'
  ) or not has_function_privilege(
    'anon','public.record_promo_vote(uuid,text,text)','EXECUTE'
  ) then
    raise exception 'ROLLBACK FAIL: public RPC execute privileges were changed';
  end if;

  select count(*) into v_count from public.stores;
  if v_count <> 0 then
    raise exception 'ROLLBACK FAIL: unexpected persistent fixture stores';
  end if;
  select count(*) into v_count from public.promo_codes;
  if v_count <> 0 then
    raise exception 'ROLLBACK FAIL: unexpected persistent fixture promo codes';
  end if;
end;
$verify$;
