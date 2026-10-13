-- P3.1 business application and admin verification; DISPOSABLE POSTGRES ONLY.
-- Roll back every synthetic applicant and verified business.
begin;

insert into auth.users(id,email) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin@ci.invalid'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','merchant-a@ci.invalid'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','merchant-b@ci.invalid');
insert into public.profiles(id,role) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','user'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','user');

-- A visitor has no direct reads or writes on private applications.
do $anon_access$
begin
  if has_table_privilege('anon','public.merchant_applications','SELECT')
    or has_table_privilege('anon','public.merchant_applications','INSERT')
    or has_function_privilege('anon','public.review_merchant_application(uuid,text)','EXECUTE')
  then raise exception 'FAIL: anonymous application access leaked'; end if;
end;
$anon_access$;

set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);

insert into public.merchant_applications (
  applicant_user_id,organization_name,organization_type,contact_email
) values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'Merchant A','company','business-a@ci.invalid'
);

do $user_a$
declare
  v_rows integer;
  v_blocked boolean := false;
begin
  select count(*) into v_rows from public.merchant_applications;
  if v_rows<>1 then raise exception 'FAIL: A cannot read own pending application'; end if;

  -- A user must never change verification status directly.
  begin
    update public.merchant_applications
    set status='approved'
    where id=(select id from public.merchant_applications where applicant_user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  exception when insufficient_privilege then v_blocked := true; end;
  if not v_blocked then raise exception 'FAIL: applicant directly changed review status'; end if;

  v_blocked := false;
  begin
    perform public.review_merchant_application(
      (select id from public.merchant_applications where applicant_user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),'approve');
  exception when insufficient_privilege then v_blocked := true; end;
  if not v_blocked then raise exception 'FAIL: applicant approved own business'; end if;

  v_blocked := false;
  begin
    insert into public.merchant_applications
      (applicant_user_id,organization_name,organization_type,contact_email)
    values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            'Impersonation','shop','evil@ci.invalid');
  exception when insufficient_privilege then v_blocked := true; end;
  if not v_blocked then raise exception 'FAIL: applicant impersonated another user'; end if;

  v_blocked := false;
  begin
    insert into public.merchant_applications
      (applicant_user_id,organization_name,organization_type,contact_email)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            'Duplicate pending','shop','duplicate@ci.invalid');
  exception when unique_violation then v_blocked := true; end;
  if not v_blocked then raise exception 'FAIL: same applicant submitted multiple pending businesses'; end if;
end;
$user_a$;

select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
insert into public.merchant_applications
 (applicant_user_id,organization_name,organization_type,contact_email)
values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'Merchant B','service_provider','business-b@ci.invalid');

do $user_b$
declare n integer;
begin
 select count(*) into n from public.merchant_applications;
 if n<>1 then raise exception 'FAIL: applicant B accessed applicant A'; end if;
end $user_b$;

-- No ordinary user can update another member's company or verify another org.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $admin_review$
declare
  v_org uuid;
  v_count integer;
  v_blocked boolean:=false;
begin
  select count(*) into v_count from public.merchant_applications;
  if v_count<>2 then raise exception 'FAIL: platform admin cannot see full review queue'; end if;

  begin
    perform public.review_merchant_application(
      (select id from public.merchant_applications where applicant_user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),null);
  exception when invalid_parameter_value then v_blocked:=true; end;
  if not v_blocked then raise exception 'FAIL: null review decision was allowed'; end if;
  v_blocked:=false;

  select public.review_merchant_application(
    (select id from public.merchant_applications where applicant_user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),'approve'
  ) into v_org;
  if v_org is null then raise exception 'FAIL: approved business had no organization'; end if;

  select count(*) into v_count from public.merchant_organizations
  where id=v_org and name='Merchant A' and status='verified';
  if v_count<>1 then raise exception 'FAIL: admin approval did not verify business'; end if;

  select count(*) into v_count from public.merchant_memberships
  where organization_id=v_org
    and user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    and member_role='owner' and status='active';
  if v_count<>1 then raise exception 'FAIL: approval failed to create initial owner'; end if;

  select count(*) into v_count from public.merchant_applications
  where id=(select id from public.merchant_applications where applicant_user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
    and status='approved' and approved_organization_id=v_org
    and reviewed_by='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if v_count<>1 then raise exception 'FAIL: approved review record inconsistent'; end if;

  begin
    perform public.review_merchant_application(
      (select id from public.merchant_applications where applicant_user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),'approve');
  exception when invalid_parameter_value then v_blocked:=true; end;
  if not v_blocked then raise exception 'FAIL: same application approved twice'; end if;

  perform public.review_merchant_application(
    (select id from public.merchant_applications where applicant_user_id='cccccccc-cccc-4ccc-8ccc-cccccccccccc'),'reject');
  select count(*) into v_count from public.merchant_applications
  where id=(select id from public.merchant_applications where applicant_user_id='cccccccc-cccc-4ccc-8ccc-cccccccccccc') and status='rejected'
    and approved_organization_id is null;
  if v_count<>1 then raise exception 'FAIL: rejection did not finalize application'; end if;

  select count(*) into v_count from public.merchant_organizations;
  if v_count<>1 then raise exception 'FAIL: rejected applicant was wrongly given business'; end if;
end;
$admin_review$;

select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $approved_member$
declare n integer;
begin
 select count(*) into n from public.merchant_organizations
 where name='Merchant A' and status='verified';
 if n<>1 then raise exception 'FAIL: approved owner cannot see verified business'; end if;

 select count(*) into n from public.merchant_applications where status='approved';
 if n<>1 then raise exception 'FAIL: applicant cannot see approval status'; end if;

 select count(*) into n from public.merchant_memberships where status='active';
 if n<>1 then raise exception 'FAIL: owner cannot see own active membership'; end if;
end;
$approved_member$;

select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
do $rejected_member$
declare n integer;
begin
 select count(*) into n from public.merchant_organizations;
 if n<>0 then raise exception 'FAIL: rejected member gained merchant access'; end if;
 select count(*) into n from public.merchant_applications where status='rejected';
 if n<>1 then raise exception 'FAIL: rejected applicant cannot see review result'; end if;
end;
$rejected_member$;

reset role;
rollback;
