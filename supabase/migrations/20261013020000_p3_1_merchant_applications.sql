-- P3.1 merchant business application + platform-admin verification.
-- PROPOSED ONLY: never execute against production before explicit approval.
-- Apply only AFTER P3.0 merchant organization/membership foundation.
-- No existing users, stores, promos, grants or admin roles are altered.

create table public.merchant_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references auth.users (id) on delete cascade,
  organization_name text not null
    check (char_length(btrim(organization_name)) between 2 and 200),
  organization_type text not null
    check (organization_type in ('company','shop','service_provider')),
  website_url text,
  contact_email text not null check (char_length(btrim(contact_email)) between 3 and 254),
  company_registration_number text,
  application_note text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_organization_id uuid unique references public.merchant_organizations(id)
    on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_application_review_state_check check (
    (status='pending' and reviewed_by is null and reviewed_at is null
      and approved_organization_id is null)
    or
    (status='approved' and reviewed_by is not null and reviewed_at is not null
      and approved_organization_id is not null)
    or
    (status='rejected' and reviewed_by is not null and reviewed_at is not null
      and approved_organization_id is null)
  )
);

create unique index merchant_applications_one_pending_per_applicant
  on public.merchant_applications (applicant_user_id) where status='pending';

create index merchant_applications_review_queue
  on public.merchant_applications(status, created_at)
  where status='pending';

alter table public.merchant_applications enable row level security;

create policy "P3.1 applicant reads own application"
on public.merchant_applications for select to authenticated
using (applicant_user_id = (select auth.uid()));

create policy "P3.1 admin reviews applications"
on public.merchant_applications for select to authenticated
using (exists (
 select 1 from public.profiles p
 where p.id = (select auth.uid()) and p.role='admin'
));

create policy "P3.1 applicant submits pending application"
on public.merchant_applications for insert to authenticated
with check (
  applicant_user_id = (select auth.uid())
  and status='pending'
  and reviewed_by is null and reviewed_at is null
  and approved_organization_id is null
);

revoke all on public.merchant_applications from anon, authenticated;
grant select on public.merchant_applications to authenticated;
grant insert (
  applicant_user_id,organization_name,organization_type,
  website_url,contact_email,company_registration_number,application_note
) on public.merchant_applications to authenticated;

-- Atomic verification: only existing PLATFORM ADMIN can promote an application.
-- Admin cannot assign an existing store or modify a profile role through this RPC.
-- Review is irreversible through this function; changes need a separate process.
create or replace function public.review_merchant_application(
  p_application_id uuid,
  p_decision text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $merchant_review$
declare
  v_reviewer uuid := auth.uid();
  v_application public.merchant_applications%rowtype;
  v_organization_id uuid;
begin
  if v_reviewer is null or not exists (
    select 1 from public.profiles p
    where p.id=v_reviewer and p.role='admin'
  ) then
    raise exception 'merchant review forbidden' using errcode='42501';
  end if;
  if p_application_id is null
    or p_decision not in ('approve','reject') then
    raise exception 'invalid merchant review request' using errcode='22023';
  end if;

  select * into v_application
  from public.merchant_applications
  where id=p_application_id for update;

  if not found or v_application.status <> 'pending' then
    raise exception 'merchant application is not pending' using errcode='22023';
  end if;

  if p_decision='reject' then
    update public.merchant_applications
    set status='rejected', reviewed_by=v_reviewer, reviewed_at=now(), updated_at=now()
    where id=p_application_id;
    return null;
  end if;

  insert into public.merchant_organizations (
    name, organization_type, status, website_url,
    contact_email, company_registration_number, created_by,
    verified_by, verified_at
  ) values (
    v_application.organization_name, v_application.organization_type,
    'verified', v_application.website_url, v_application.contact_email,
    v_application.company_registration_number, v_application.applicant_user_id,
    v_reviewer, now()
  ) returning id into v_organization_id;

  insert into public.merchant_memberships (
    organization_id,user_id,member_role,status
  ) values (
    v_organization_id,v_application.applicant_user_id,'owner','active'
  );

  update public.merchant_applications
  set status='approved', reviewed_by=v_reviewer, reviewed_at=now(),
      approved_organization_id=v_organization_id, updated_at=now()
  where id=p_application_id;

  return v_organization_id;
end;
$merchant_review$;

revoke all on function public.review_merchant_application(uuid,text) from public;
revoke all on function public.review_merchant_application(uuid,text) from anon;
grant execute on function public.review_merchant_application(uuid,text)
  to authenticated;
