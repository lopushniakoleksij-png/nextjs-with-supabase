-- P3.2 Merchant Office — PROPOSED ONLY, NEVER APPLY TO LIVE WITHOUT SIGN-OFF.
-- Must follow P3.0 organization schema and P3.1 verified merchant workflow.
-- Safe P2 integration requires a separate migration-order review before release.
-- All writes derive caller identity from auth.uid() INSIDE the database.
-- Merchant grants on legacy tables do not change; platform administrators remain admins.

do $p3_2_guard$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='promo_codes'
      and policyname='Submit or admin insert promos' and cmd='INSERT'
  ) then
    raise exception 'P3.2 unexpected promo insert policy: abort migration';
  end if;
end;
$p3_2_guard$;

-- Authenticated merchants need to filter by store owner and item reference.
-- RLS below still guards the underlying rows; no new anon privileges.
grant select (merchant_organization_id) on public.stores to authenticated;
grant select (merchant_item_id) on public.promo_codes to authenticated;

create policy "P3.2 verified member sees own stores"
on public.stores for select to authenticated
using (
  merchant_organization_id is not null and exists (
    select 1 from public.merchant_memberships m
    join public.merchant_organizations o on o.id=m.organization_id
    where m.organization_id=stores.merchant_organization_id
      and m.user_id=(select auth.uid()) and m.status='active'
      and o.status='verified'
  )
);

create policy "P3.2 verified member sees own promos"
on public.promo_codes for select to authenticated
using (exists (
  select 1 from public.stores s
  join public.merchant_memberships m
    on m.organization_id=s.merchant_organization_id
  join public.merchant_organizations o on o.id=m.organization_id
  where s.id=promo_codes.store_id
    and m.user_id=(select auth.uid()) and m.status='active'
    and o.status='verified'
));

-- Replace broad "any signed-in user can submit to any store" legacy policy:
-- only verified members can submit to their own active stores. This is
-- intentional for the business-operated product; admins retain their path.
alter policy "Submit or admin insert promos" on public.promo_codes
with check (
  (
    exists (
      select 1 from public.profiles p
      where p.id=(select auth.uid()) and p.role='admin'
    )
  ) or (
    approved=false
    and submitted_by=(select auth.uid())
    and exists (
      select 1 from public.stores s
      join public.merchant_memberships m
        on m.organization_id=s.merchant_organization_id
      join public.merchant_organizations o on o.id=m.organization_id
      where s.id=store_id and s.is_active=true
        and m.user_id=(select auth.uid()) and m.status='active'
        and o.status='verified'
    )
  )
);

-- Only owner or manager may open a new branch/store under their company.
-- Never allow a merchant to attach/claim an existing store by slug.
create or replace function public.merchant_create_store(
  p_organization_id uuid, p_name text, p_slug text, p_website_url text default null
)
returns uuid
language plpgsql security definer set search_path=''
as $body$
declare v_id uuid;
begin
  if auth.uid() is null or p_organization_id is null or p_name is null
     or char_length(btrim(p_name)) not between 2 and 200
     or p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or char_length(p_slug)>100
     or (p_website_url is not null and
         (char_length(p_website_url)>2048 or p_website_url !~* '^https?://'))
  then
    raise exception 'invalid store details' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.merchant_memberships m
    join public.merchant_organizations o on o.id=m.organization_id
    where m.organization_id=p_organization_id and m.user_id=auth.uid()
      and m.status='active' and m.member_role in ('owner','manager')
      and o.status='verified'
  ) then
    raise exception 'merchant store action forbidden' using errcode='42501';
  end if;

  insert into public.stores(name,slug,website_url,is_active,merchant_organization_id)
  values (btrim(p_name),p_slug,p_website_url,true,p_organization_id)
  returning id into v_id;
  return v_id;
end;
$body$;

-- All active verified business members may create private product/service
-- subjects in an owned active store. Items cannot be moved between tenants.
create or replace function public.merchant_create_item(
  p_organization_id uuid, p_store_id uuid, p_item_type text,
  p_name text, p_description text default null, p_destination_url text default null
)
returns uuid
language plpgsql security definer set search_path=''
as $body$
declare v_id uuid;
begin
  if auth.uid() is null or p_organization_id is null or p_store_id is null
    or p_item_type is null or p_item_type not in ('product','service')
    or p_name is null or char_length(btrim(p_name)) not between 2 and 200
    or (p_description is not null and char_length(p_description)>3000)
    or (p_destination_url is not null and
         (char_length(p_destination_url)>2048 or p_destination_url !~* '^https?://'))
  then
    raise exception 'invalid item details' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.merchant_memberships m
    join public.merchant_organizations o on o.id=m.organization_id
    join public.stores s on s.merchant_organization_id=o.id
    where m.organization_id=p_organization_id and m.user_id=auth.uid()
      and m.status='active' and o.status='verified'
      and s.id=p_store_id and s.is_active=true
  ) then
    raise exception 'merchant item action forbidden' using errcode='42501';
  end if;
  insert into public.merchant_items
    (organization_id,store_id,item_type,name,description,destination_url)
  values
    (p_organization_id,p_store_id,p_item_type,btrim(p_name),
     nullif(btrim(p_description),''),p_destination_url)
  returning id into v_id;
  return v_id;
end;
$body$;

-- Merchant submitted promotions always stay PENDING; merchants cannot
-- approve, set clicks, revive a disabled store or reference another shop's item.
create or replace function public.merchant_submit_promo(
  p_organization_id uuid, p_store_id uuid, p_item_id uuid,
  p_code text, p_title text, p_description text,
  p_destination_url text, p_expires_at timestamptz default null
)
returns uuid
language plpgsql security definer set search_path=''
as $body$
declare v_id uuid;
begin
  if auth.uid() is null or p_organization_id is null or p_store_id is null
     or p_code is null or char_length(btrim(p_code)) not between 1 and 80
     or p_destination_url is null or char_length(p_destination_url)>2048
     or p_destination_url !~* '^https?://'
     or (p_title is not null and char_length(p_title)>200)
     or (p_description is not null and char_length(p_description)>3000)
     or (p_expires_at is not null and p_expires_at<=now())
  then
    raise exception 'invalid promo details' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.merchant_memberships m
    join public.merchant_organizations o on o.id=m.organization_id
    join public.stores s on s.merchant_organization_id=o.id
    where m.organization_id=p_organization_id and m.user_id=auth.uid()
      and m.status='active' and o.status='verified'
      and s.id=p_store_id and s.is_active=true
  ) then
    raise exception 'merchant promo action forbidden' using errcode='42501';
  end if;
  if p_item_id is not null and not exists (
    select 1 from public.merchant_items i
    where i.id=p_item_id and i.organization_id=p_organization_id
      and i.store_id=p_store_id and i.is_active=true
  ) then
    raise exception 'promo item does not belong to store' using errcode='42501';
  end if;
  insert into public.promo_codes
    (store_id,merchant_item_id,code,title,description,destination_url,
     expires_at,submitted_by,approved,is_active)
  values
    (p_store_id,p_item_id,btrim(p_code),nullif(btrim(p_title),''),
     nullif(btrim(p_description),''),p_destination_url,p_expires_at,
     auth.uid(),false,true)
  returning id into v_id;
  return v_id;
end;
$body$;

-- Owner/manager can immediately withdraw an offer; never restore/publish it.
-- Re-enabling or changing material details requires new admin review.
create or replace function public.merchant_withdraw_promo(
  p_organization_id uuid, p_promo_id uuid
)
returns boolean
language plpgsql security definer set search_path=''
as $body$
declare v_count integer;
begin
  if auth.uid() is null or p_organization_id is null or p_promo_id is null then
    raise exception 'invalid withdrawal request' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.merchant_memberships m
    join public.merchant_organizations o on o.id=m.organization_id
    where m.organization_id=p_organization_id and m.user_id=auth.uid()
      and m.status='active' and m.member_role in ('owner','manager')
      and o.status='verified'
  ) then
    raise exception 'merchant withdrawal forbidden' using errcode='42501';
  end if;
  update public.promo_codes pc set is_active=false,updated_at=now()
  where pc.id=p_promo_id and pc.is_active=true
    and exists (
      select 1 from public.stores s
      where s.id=pc.store_id and s.merchant_organization_id=p_organization_id
    );
  get diagnostics v_count = row_count;
  return v_count=1;
end;
$body$;

-- All RPC access requires authenticated JWT, with database-side role checks.
revoke all on function public.merchant_create_store(uuid,text,text,text) from public,anon;
revoke all on function public.merchant_create_item(uuid,uuid,text,text,text,text) from public,anon;
revoke all on function public.merchant_submit_promo(uuid,uuid,uuid,text,text,text,text,timestamptz) from public,anon;
revoke all on function public.merchant_withdraw_promo(uuid,uuid) from public,anon;
grant execute on function public.merchant_create_store(uuid,text,text,text) to authenticated;
grant execute on function public.merchant_create_item(uuid,uuid,text,text,text,text) to authenticated;
grant execute on function public.merchant_submit_promo(uuid,uuid,uuid,text,text,text,text,timestamptz) to authenticated;
grant execute on function public.merchant_withdraw_promo(uuid,uuid) to authenticated;
