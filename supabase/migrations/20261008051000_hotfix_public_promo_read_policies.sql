-- Production repair: isolate anonymous storefront reads from profile-dependent
-- administrator policies. Preserve grants, existing authenticated permissions,
-- and the private profiles table. Compatible with fresh and previously migrated DBs.
do $public_storefront_hotfix$
begin
  -- A legacy shared policy calls public.profiles when the role is anon.
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'promo_codes'
      and policyname = 'Readable promos'
  ) then
    execute 'alter policy "Readable promos" on public.promo_codes to authenticated';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'stores'
      and policyname = 'Readable stores'
  ) then
    execute 'alter policy "Readable stores" on public.stores to authenticated';
  end if;

  -- Leave independently existing R1 public policies in place. Dedicated
  -- anonymous policies are safe to rerun after the hotfix was already applied.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'promo_codes'
      and policyname = 'Anonymous read live promos'
  ) then
    execute 'create policy "Anonymous read live promos" on public.promo_codes
      for select to anon
      using (approved = true and is_active = true
        and (expires_at is null or expires_at > now()))';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'stores'
      and policyname = 'Anonymous read active stores'
  ) then
    execute 'create policy "Anonymous read active stores" on public.stores
      for select to anon using (is_active = true)';
  end if;
end;
$public_storefront_hotfix$;
