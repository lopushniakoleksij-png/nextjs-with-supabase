-- P3 tenant isolation acceptance. Only for disposable PostgreSQL CI database.
-- No real Supabase user or customer records are created. Everything rolls back.
begin;

insert into auth.users(id,email) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p3-admin@example.invalid'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','p3-owner-a@example.invalid'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','p3-owner-b@example.invalid'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','p3-revoked@example.invalid');
insert into public.profiles(id,role) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','user'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','user'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','user');

insert into public.merchant_organizations(id,name,organization_type,status) values
 ('11111111-1111-4111-8111-111111111111','P3 Company A','company','verified'),
 ('22222222-2222-4222-8222-222222222222','P3 Company B','shop','verified'),
 ('33333333-3333-4333-8333-333333333333','P3 Pending Business','service_provider','pending');

insert into public.merchant_memberships(organization_id,user_id,member_role,status) values
 ('11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','owner','active'),
 ('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd','editor','revoked'),
 ('22222222-2222-4222-8222-222222222222','cccccccc-cccc-4ccc-8ccc-cccccccccccc','owner','active'),
 ('33333333-3333-4333-8333-333333333333','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','owner','active');

insert into public.stores(id,name,slug,merchant_organization_id) values
 ('44444444-4444-4444-8444-444444444444','P3 Company A flagship','p3-a-flagship','11111111-1111-4111-8111-111111111111'),
 ('55555555-5555-4555-8555-555555555555','P3 Company A branch','p3-a-branch','11111111-1111-4111-8111-111111111111'),
 ('66666666-6666-4666-8666-666666666666','P3 Company B shop','p3-b-shop','22222222-2222-4222-8222-222222222222'),
 ('77777777-7777-4777-8777-777777777777','P3 Pending service','p3-pending','33333333-3333-4333-8333-333333333333'),
 ('88888888-8888-4888-8888-888888888888','P3 legacy unclaimed','p3-legacy-unclaimed',null);

insert into public.merchant_items(id,organization_id,store_id,item_type,name) values
 ('99999999-9999-4999-8999-999999999999','11111111-1111-4111-8111-111111111111','44444444-4444-4444-8444-444444444444','product','P3 A appliance'),
 ('aaaaaaaa-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','55555555-5555-4555-8555-555555555555','service','P3 A installation'),
 ('bbbbbbbb-0000-4000-8000-000000000001','22222222-2222-4222-8222-222222222222','66666666-6666-4666-8666-666666666666','product','P3 B product'),
 ('cccccccc-0000-4000-8000-000000000001','33333333-3333-4333-8333-333333333333','77777777-7777-4777-8777-777777777777','service','P3 pending service');

-- Existing promotions don't require an item association (backward-compatible).
insert into public.promo_codes(store_id,code) values
 ('88888888-8888-4888-8888-888888888888','P3-LEGACY-OFFER');
insert into public.promo_codes(store_id,code,merchant_item_id) values
 ('44444444-4444-4444-8444-444444444444','P3-A-ITEM-OFFER','99999999-9999-4999-8999-999999999999');

-- Constraint tests must work regardless of RLS rules.
do $integrity$
declare
  blocked boolean := false;
begin
  begin
    insert into public.merchant_items(organization_id,store_id,item_type,name)
    values ('11111111-1111-4111-8111-111111111111',
            '66666666-6666-4666-8666-666666666666','product','Incorrect tenant item');
  exception when foreign_key_violation then blocked := true; end;
  if not blocked then raise exception 'FAIL: cross-company item/store binding allowed'; end if;

  blocked := false;
  begin
    insert into public.promo_codes(store_id,code,merchant_item_id)
    values ('66666666-6666-4666-8666-666666666666',
            'P3-CROSS-STORE','99999999-9999-4999-8999-999999999999');
  exception when foreign_key_violation then blocked := true; end;
  if not blocked then raise exception 'FAIL: cross-shop promo/item reference allowed'; end if;

  blocked := false;
  begin
    insert into public.merchant_items(organization_id,store_id,item_type,name)
    values ('11111111-1111-4111-8111-111111111111',
            '88888888-8888-4888-8888-888888888888','product','Claimed legacy item');
  exception when foreign_key_violation then blocked := true; end;
  if not blocked then raise exception 'FAIL: unclaimed legacy store can be impersonated'; end if;
end $integrity$;

-- No anonymous privileges on newly private merchant tables.
do $anon$
begin
  if has_table_privilege('anon','public.merchant_organizations','SELECT')
     or has_table_privilege('anon','public.merchant_memberships','SELECT')
     or has_table_privilege('anon','public.merchant_items','SELECT') then
    raise exception 'FAIL: merchant private tables exposed to anonymous clients';
  end if;
end $anon$;

set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);

do $member_a$
declare n integer;
begin
  select count(*) into n from public.merchant_organizations;
  if n <> 2 then raise exception 'FAIL: member A sees other verified company or wrong pending org count: %',n; end if;
  select count(*) into n from public.merchant_memberships;
  if n <> 2 then raise exception 'FAIL: member A sees coworkers or foreign memberships: %',n; end if;
  select count(*) into n from public.merchant_items;
  if n <> 2 then raise exception 'FAIL: member A sees wrong item count (own verified company only): %',n; end if;
end $member_a$;

-- A regular merchant cannot appoint owners, self-verify or create items yet.
do $member_mutation$
declare
  n integer;
  denied boolean := false;
begin
  update public.merchant_memberships
  set member_role = 'owner'
  where user_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: user A escalated other merchant membership'; end if;

  update public.merchant_organizations set status='verified'
  where id='33333333-3333-4333-8333-333333333333';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: regular user verified own pending business'; end if;

  begin
    insert into public.merchant_items(organization_id,store_id,item_type,name)
    values ('11111111-1111-4111-8111-111111111111',
            '44444444-4444-4444-8444-444444444444','product','Unauthorized addition');
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: unapproved merchant write to item table'; end if;
end $member_mutation$;

-- Cross-tenant isolation checks for another active user.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
do $member_b$
declare n integer;
begin
  select count(*) into n from public.merchant_organizations;
  if n <> 1 then raise exception 'FAIL: member B sees another organization'; end if;
  select count(*) into n from public.merchant_items;
  if n <> 1 then raise exception 'FAIL: member B sees another tenant item'; end if;
end $member_b$;

-- Revoked users retain only access to their own revoked membership state.
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',true);
do $revoked$
declare n integer;
begin
  select count(*) into n from public.merchant_memberships;
  if n <> 1 then raise exception 'FAIL: revoked membership introspection'; end if;
  select count(*) into n from public.merchant_organizations;
  if n <> 0 then raise exception 'FAIL: revoked member can still view business'; end if;
  select count(*) into n from public.merchant_items;
  if n <> 0 then raise exception 'FAIL: revoked member can still view items'; end if;
end $revoked$;

-- Platform admin can still inspect all businesses and perform verification.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $admin$
declare n integer;
begin
  select count(*) into n from public.merchant_organizations;
  if n <> 3 then raise exception 'FAIL: platform admin lost org oversight'; end if;
  select count(*) into n from public.merchant_memberships;
  if n <> 4 then raise exception 'FAIL: platform admin lost membership oversight'; end if;
  select count(*) into n from public.merchant_items;
  if n <> 4 then raise exception 'FAIL: platform admin lost item oversight'; end if;
end $admin$;

-- An admin suspension immediately hides that business's items from its member.
update public.merchant_organizations set status='suspended'
where id='11111111-1111-4111-8111-111111111111';
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $suspended$
declare n integer;
begin
 select count(*) into n from public.merchant_items;
 if n <> 0 then raise exception 'FAIL: suspended business still grants item read'; end if;
end $suspended$;

reset role;
rollback;
-- All fixtures disposed at end of each CI run.
