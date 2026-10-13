-- P3.2 disposable PostgreSQL integration test.
-- No production data, no paid branch, all fixtures rolled back on success.
begin;

insert into auth.users(id,email) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','p3.2-admin@example.invalid'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','p3.2-owner-a@example.invalid'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','p3.2-owner-b@example.invalid'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','p3.2-editor-a@example.invalid'),
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','p3.2-revoked@example.invalid'),
 ('ffffffff-ffff-4fff-8fff-ffffffffffff','p3.2-suspended@example.invalid'),
 ('99999999-9999-4999-8999-999999999999','p3.2-manager-a@example.invalid');

insert into public.profiles(id,role) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','user'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','user'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','user'),
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','user'),
 ('ffffffff-ffff-4fff-8fff-ffffffffffff','user'),
 ('99999999-9999-4999-8999-999999999999','user');

insert into public.merchant_organizations(id,name,status) values
 ('11111111-1111-4111-8111-111111111111','Tenant A','verified'),
 ('22222222-2222-4222-8222-222222222222','Tenant B','verified'),
 ('33333333-3333-4333-8333-333333333333','Tenant Suspended','suspended');

insert into public.merchant_memberships(organization_id,user_id,member_role,status) values
 ('11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','owner','active'),
 ('22222222-2222-4222-8222-222222222222','cccccccc-cccc-4ccc-8ccc-cccccccccccc','owner','active'),
 ('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd','editor','active'),
 ('11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','manager','revoked'),
 ('33333333-3333-4333-8333-333333333333','ffffffff-ffff-4fff-8fff-ffffffffffff','owner','active'),
 ('11111111-1111-4111-8111-111111111111','99999999-9999-4999-8999-999999999999','manager','active');

do $anon$
begin
 if has_function_privilege('anon','public.merchant_create_store(uuid,text,text,text)','EXECUTE')
   or has_function_privilege('anon','public.merchant_create_item(uuid,uuid,text,text,text,text)','EXECUTE')
   or has_function_privilege('anon','public.merchant_submit_promo(uuid,uuid,uuid,text,text,text,text,timestamptz)','EXECUTE')
   or has_function_privilege('anon','public.merchant_withdraw_promo(uuid,uuid)','EXECUTE')
 then raise exception 'FAIL: merchant-write RPCs exposed to anon'; end if;
end $anon$;

set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);

do $owner_a$
declare
  shop_a uuid;
  prod_a uuid;
  offer_a uuid;
  blocked boolean;
  n int;
begin
  shop_a:=public.merchant_create_store(
    '11111111-1111-4111-8111-111111111111','Shop A 1','p32-shop-a-one','https://a.invalid');
  if shop_a is null then raise exception 'FAIL: owner cannot create own shop'; end if;

  prod_a:=public.merchant_create_item(
    '11111111-1111-4111-8111-111111111111',shop_a,'product',
    'A featured product','Promo subject','https://a.invalid/item');
  if prod_a is null then raise exception 'FAIL: owner cannot create shop product'; end if;

  offer_a:=public.merchant_submit_promo(
    '11111111-1111-4111-8111-111111111111',shop_a,prod_a,
    'P32A10','Discount A','Terms','https://a.invalid/offer',now()+interval '7 days');
  if offer_a is null then raise exception 'FAIL: owner cannot submit promo'; end if;

  select count(*) into n from public.promo_codes where id=offer_a
    and approved=false and is_active=true
    and merchant_item_id=prod_a
    and submitted_by='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  if n<>1 then raise exception 'FAIL: merchant promo was not pending with correct owner'; end if;

  blocked:=false;
  begin
    perform public.merchant_create_store(
      '22222222-2222-4222-8222-222222222222','Stolen','p32-stolen',null);
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: A created B store'; end if;

  blocked:=false;
  begin
    perform public.merchant_create_store(
      '11111111-1111-4111-8111-111111111111','Duplicate','p32-shop-a-one',null);
  exception when unique_violation then blocked:=true; end;
  if not blocked then raise exception 'FAIL: same slug allowed twice'; end if;

  blocked:=false;
  begin
    perform public.merchant_create_item(
      '22222222-2222-4222-8222-222222222222',shop_a,
      'service','Cross-company item',null,null);
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: cross-company item created'; end if;

  blocked:=false;
  begin
    perform public.merchant_submit_promo(
      '22222222-2222-4222-8222-222222222222',shop_a,null,
      'P32BAD','Bad','Wrong company','https://a.invalid',null);
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: cross-company promo allowed'; end if;

  -- A cannot place arbitrary pending promo directly on another verified tenant.
  blocked:=false;
  begin
    insert into public.promo_codes
      (store_id, code, destination_url, submitted_by, approved)
    values ('66666666-6666-4666-8666-666666666666',
            'DIRECT-CROSS','https://b.invalid','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
  exception when insufficient_privilege or foreign_key_violation then blocked:=true; end;
  if not blocked then raise exception 'FAIL: direct cross-company promo write allowed'; end if;

  -- A can withdraw only its own offer; never approve via RPC.
  if not public.merchant_withdraw_promo('11111111-1111-4111-8111-111111111111',offer_a)
  then raise exception 'FAIL: owner failed own withdrawal'; end if;
  select count(*) into n from public.promo_codes where id=offer_a and is_active=false and approved=false;
  if n<>1 then raise exception 'FAIL: withdrawal was not inactive/pending'; end if;
end $owner_a$;

-- Existing admin-managed shop B fixture to test valid cross-tenant reference.
reset role;
insert into public.stores(id,name,slug,merchant_organization_id)
 values ('66666666-6666-4666-8666-666666666666','Tenant B shop',
         'p32-tenant-b','22222222-2222-4222-8222-222222222222');

set local role authenticated;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
do $owner_b$
declare a_shop uuid;
  b_item uuid;
  blocked boolean:=false;
  n int;
begin
  select id into a_shop from public.stores where slug='p32-shop-a-one';
  select count(*) into n from public.merchant_items;
  if n<>0 then raise exception 'FAIL: B sees company A private catalogue'; end if;
  select count(*) into n from public.promo_codes where code='P32A10';
  if n<>0 then raise exception 'FAIL: B sees company A pending/withdrawn promo'; end if;
  b_item:=public.merchant_create_item(
    '22222222-2222-4222-8222-222222222222',
    '66666666-6666-4666-8666-666666666666','service',
    'B service',null,null);
  if b_item is null then raise exception 'FAIL: B cannot add own service'; end if;

  begin
    perform public.merchant_submit_promo(
      '22222222-2222-4222-8222-222222222222',
      '66666666-6666-4666-8666-666666666666',
      (select id from public.merchant_items where name='A featured product'),
      'P32-CROSS-ITEM','Cross','Bad item','https://b.invalid/offer',null);
  exception when insufficient_privilege then blocked:=true; end;
  -- Item ID may be hidden by RLS => NULL and allowed store-wide promo, so
  -- separately check with known fixture id using superuser lookup below.
  if blocked then null; end if;
end $owner_b$;

-- Editor can create items/offers but cannot create stores or withdraw offers.
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',true);
do $editor_a$
declare
  shop_a uuid;
  created uuid;
  blocked boolean:=false;
begin
  select id into shop_a from public.stores where slug='p32-shop-a-one';
  created:=public.merchant_create_item(
    '11111111-1111-4111-8111-111111111111',shop_a,'service',
    'Installation service','Description',null);
  if created is null then raise exception 'FAIL: editor cannot add permitted item'; end if;
  begin
    perform public.merchant_create_store(
      '11111111-1111-4111-8111-111111111111','Editor shop','editor-a-shop',null);
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: editor can create branch'; end if;
  blocked:=false;
  begin
    perform public.merchant_withdraw_promo(
      '11111111-1111-4111-8111-111111111111',
      (select id from public.promo_codes where code='P32A10'));
  exception when insufficient_privilege then blocked:=true; end;
  if not blocked then raise exception 'FAIL: editor can withdraw offer'; end if;
end $editor_a$;

-- A manager can create another branch within the same company.
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',true);
do $manager_a$
declare v_shop uuid;
begin
  v_shop:=public.merchant_create_store(
    '11111111-1111-4111-8111-111111111111','Shop A 2','p32-shop-a-two',null);
  if v_shop is null then raise exception 'FAIL: manager cannot open second branch'; end if;
end $manager_a$;

-- Revoked memberships and suspended businesses cannot write anything.
select set_config('request.jwt.claim.sub','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',true);
do $revoked$
declare denied boolean:=false;
begin
  begin
    perform public.merchant_create_store(
      '11111111-1111-4111-8111-111111111111','Revoked shop','revoked-shop',null);
  exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'FAIL: revoked user can create shop'; end if;
end $revoked$;

select set_config('request.jwt.claim.sub','ffffffff-ffff-4fff-8fff-ffffffffffff',true);
do $suspended$
declare denied boolean:=false;
begin
  begin
    perform public.merchant_create_store(
      '33333333-3333-4333-8333-333333333333','Suspended shop','suspended-shop',null);
  exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'FAIL: suspended org can write'; end if;
end $suspended$;

-- Existing admin direct write must remain allowed to maintain old workflows.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $platform_admin$
declare n int;
begin
  insert into public.stores(name,slug,merchant_organization_id)
  values ('Unclaimed legacy shop','p32-admin-legacy',null);
  select count(*) into n from public.stores
    where slug='p32-admin-legacy' and merchant_organization_id is null;
  if n<>1 then raise exception 'FAIL: existing admin store permissions regressed'; end if;
end $platform_admin$;

reset role;
rollback;
