-- P2 DATABASE INTEGRATION TEST -- ISOLATED DEVELOPMENT BRANCH ONLY.
-- Execute after the P2 migration, not on the production Supabase project.
-- Uses a transaction and explicitly ROLLBACKs all fixture data.
begin;

do $fixture$
declare
  v_on_store uuid;
  v_off_store uuid;
  v_on_promo uuid;
  v_off_promo uuid;
  v_target text;
  v_votes int;
  v_clicks int;
  v_vote_blocked boolean := false;
begin
  insert into public.stores (name, slug, is_active)
  values ('P2 fixture active', 'p2-visibility-active-test', true)
  returning id into v_on_store;

  insert into public.stores (name, slug, is_active)
  values ('P2 fixture disabled', 'p2-visibility-disabled-test', false)
  returning id into v_off_store;

  insert into public.promo_codes
    (store_id, code, destination_url, approved, is_active)
  values
    (v_on_store, 'P2-VISIBILITY-ON', 'https://example.com/active', true, true)
  returning id into v_on_promo;

  insert into public.promo_codes
    (store_id, code, destination_url, approved, is_active)
  values
    (v_off_store, 'P2-VISIBILITY-OFF', 'https://example.com/disabled', true, true)
  returning id into v_off_promo;

  select public.record_promo_click(v_off_promo, 'p2-disabled-check') into v_target;
  if v_target is not null then
    raise exception 'FAIL: disabled-store promo allowed a redirect';
  end if;

  select count(*) into v_clicks from public.promo_clicks where promo_id = v_off_promo;
  if v_clicks <> 0 then
    raise exception 'FAIL: disabled-store promo recorded clicks';
  end if;

  begin
    perform * from public.record_promo_vote(v_off_promo, 'worked', 'p2-disabled-vote');
  exception when others then
    if position('promo not available' in SQLERRM) > 0 then
      v_vote_blocked := true;
    else
      raise;
    end if;
  end;
  if not v_vote_blocked then
    raise exception 'FAIL: disabled-store promo allowed a vote';
  end if;

  select public.record_promo_click(v_on_promo, 'p2-enabled-check') into v_target;
  if v_target <> 'https://example.com/active' then
    raise exception 'FAIL: active-store promo redirect unexpectedly blocked';
  end if;

  perform * from public.record_promo_vote(v_on_promo, 'worked', 'p2-enabled-vote');

  select count(*) into v_votes from public.promo_votes where promo_id = v_on_promo;
  if v_votes <> 1 then
    raise exception 'FAIL: active-store vote was not recorded';
  end if;
end;
$fixture$;

-- Exercise actual anon RLS visibility, not an elevated SQL-owner query.
set local role anon;
do $anon_check$
declare
  v_visible integer;
  v_hidden integer;
begin
  select count(*) into v_visible
  from public.promo_codes
  where code = 'P2-VISIBILITY-ON';
  select count(*) into v_hidden
  from public.promo_codes
  where code = 'P2-VISIBILITY-OFF';

  if v_visible <> 1 or v_hidden <> 0 then
    raise exception 'FAIL: anon visibility expected active=1, disabled=0, got % / %',
      v_visible, v_hidden;
  end if;
end;
$anon_check$;
reset role;

rollback;
-- PASS only if every assertion above succeeds. No fixtures persist.
