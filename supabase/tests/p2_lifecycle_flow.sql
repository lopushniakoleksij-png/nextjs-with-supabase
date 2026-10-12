-- Executed only on disposable PostgreSQL CI database. NEVER on production.
-- Tests admin -> user submit -> admin approval -> anon display -> store disable.
begin;

insert into public.profiles (id, role, email) values
  ('11111111-1111-4111-8111-111111111111', 'admin', 'admin-ci@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'user', 'user-ci@example.invalid');

set local role authenticated;
select set_config('request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111', true);

insert into public.stores (name, slug, is_active) values
  ('P2 lifecycle store', 'p2-lifecycle-store', true);

-- A signed-in non-admin may submit, but may not approve.
select set_config('request.jwt.claim.sub',
  '22222222-2222-4222-8222-222222222222', true);

insert into public.promo_codes
  (store_id, code, destination_url, submitted_by)
values (
  (select id from public.stores where slug = 'p2-lifecycle-store'),
  'P2-LIFECYCLE-CODE',
  'https://example.com/p2',
  '22222222-2222-4222-8222-222222222222'
);

do $user_gate$
declare
  v_updates integer;
begin
  update public.promo_codes
  set approved = true
  where code = 'P2-LIFECYCLE-CODE';
  get diagnostics v_updates = row_count;
  if v_updates <> 0 then
    raise exception 'FAIL: non-admin was able to approve a promo';
  end if;
end;
$user_gate$;

-- The administrator can review a pending submission and approve it.
select set_config('request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111', true);

do $admin_gate$
declare
  v_pending integer;
begin
  select count(*) into v_pending
  from public.promo_codes
  where code = 'P2-LIFECYCLE-CODE' and approved = false;
  if v_pending <> 1 then
    raise exception 'FAIL: admin cannot review the pending promo';
  end if;
end;
$admin_gate$;

update public.promo_codes
set approved = true
where code = 'P2-LIFECYCLE-CODE';

set local role anon;
do $public_gate$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.promo_codes
  where code = 'P2-LIFECYCLE-CODE';
  if v_count <> 1 then
    raise exception 'FAIL: approved active-store promo not visible to public';
  end if;
end;
$public_gate$;

-- Disabling the parent store must immediately remove the approved promo.
set local role authenticated;
select set_config('request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111', true);

update public.stores
set is_active = false
where slug = 'p2-lifecycle-store';

set local role anon;
do $disabled_gate$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.promo_codes
  where code = 'P2-LIFECYCLE-CODE';
  if v_count <> 0 then
    raise exception 'FAIL: disabled-store promo remained public';
  end if;
end;
$disabled_gate$;

reset role;
rollback;
-- PASS if all assertions finish with no error; no fixtures persist.
