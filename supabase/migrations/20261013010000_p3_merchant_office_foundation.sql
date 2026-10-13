-- P3 Merchant Office foundation — PROPOSED ONLY; DO NOT APPLY TO PRODUCTION.
-- Additive schema. Legacy admin roles, stores, promo records, public RLS and
-- existing SECURITY DEFINER tracking RPCs are intentionally unchanged.
-- Draft branch / isolated PostgreSQL tests first.

create table public.merchant_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 200),
  organization_type text not null default 'shop'
    check (organization_type in ('company', 'shop', 'service_provider')),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'suspended', 'rejected')),
  website_url text,
  contact_email text,
  company_registration_number text,
  created_by uuid references auth.users (id) on delete set null,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.merchant_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.merchant_organizations (id)
    on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  member_role text not null default 'editor'
    check (member_role in ('owner', 'manager', 'editor')),
  status text not null default 'invited'
    check (status in ('invited', 'active', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index merchant_memberships_user_status_idx
  on public.merchant_memberships (user_id, status, organization_id);

-- Nullable to keep all existing stores/branches unchanged and unclaimed.
-- Only existing administrator store-update rules may assign ownership.
alter table public.stores
  add column merchant_organization_id uuid
  references public.merchant_organizations (id) on delete restrict;

-- Composite FK target: a catalogue item can belong only to a store owned
-- by the same organization. A store has at most one owning merchant.
alter table public.stores
  add constraint stores_id_merchant_organization_unique
  unique (id, merchant_organization_id);

create index stores_merchant_organization_id_idx
  on public.stores (merchant_organization_id)
  where merchant_organization_id is not null;

create table public.merchant_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.merchant_organizations (id)
    on delete restrict,
  store_id uuid not null,
  item_type text not null check (item_type in ('product', 'service')),
  name text not null check (char_length(btrim(name)) between 2 and 200),
  description text,
  destination_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_items_store_org_fkey
    foreign key (store_id, organization_id)
    references public.stores (id, merchant_organization_id)
    on update restrict on delete restrict,
  constraint merchant_items_store_id_unique unique (store_id, id)
);

create index merchant_items_organization_store_idx
  on public.merchant_items (organization_id, store_id, is_active);

-- Optional link; existing shop-wide offers remain valid with NULL item.
-- Paired FK prevents binding an offer from one shop to another shop's item.
alter table public.promo_codes
  add column merchant_item_id uuid;

alter table public.promo_codes
  add constraint promo_codes_merchant_item_same_store_fkey
  foreign key (store_id, merchant_item_id)
  references public.merchant_items (store_id, id)
  on update restrict on delete restrict;

alter table public.merchant_organizations enable row level security;
alter table public.merchant_memberships enable row level security;
alter table public.merchant_items enable row level security;

-- Members may see *their own* membership (including revoked status).
-- Members cannot select coworkers or other organizations' memberships.
-- Admin policies below allow privileged review without profile.role changes.
create policy "P3 member reads own membership"
on public.merchant_memberships for select to authenticated
using (user_id = (select auth.uid()));

-- A signed-in active member can see their organization's status. Suspended
-- or rejected organizations cannot grant the merchant item read below.
create policy "P3 member reads own organization"
on public.merchant_organizations for select to authenticated
using (exists (
  select 1 from public.merchant_memberships m
  where m.organization_id = id and m.user_id = (select auth.uid())
    and m.status = 'active'
));

create policy "P3 verified member reads own items"
on public.merchant_items for select to authenticated
using (exists (
  select 1 from public.merchant_memberships m
  join public.merchant_organizations o on o.id = m.organization_id
  where m.organization_id = merchant_items.organization_id
    and m.user_id = (select auth.uid()) and m.status = 'active'
    and o.status = 'verified'
));

-- No merchant self-onboarding or writes at this FOUNDATION phase.
-- All new table writes are restricted to existing platform administrators;
-- later admin-approved onboarding will use separate reviewed server actions.
create policy "P3 admin manages organizations"
on public.merchant_organizations for all to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
));

create policy "P3 admin manages memberships"
on public.merchant_memberships for all to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
));

create policy "P3 admin manages items"
on public.merchant_items for all to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'admin'
));

-- Existing platform-admin code can use authenticated Supabase sessions.
-- Anonymous users receive NO grants for any of these new private tables.
revoke all on public.merchant_organizations from anon;
revoke all on public.merchant_memberships from anon;
revoke all on public.merchant_items from anon;

grant select, insert, update, delete on public.merchant_organizations
  to authenticated;
grant select, insert, update, delete on public.merchant_memberships
  to authenticated;
grant select, insert, update, delete on public.merchant_items
  to authenticated;

-- IMPORTANT: no additional grants on stores or promo_codes; and no changes
-- to platform-admin policies, public visibility policies, or account roles.
