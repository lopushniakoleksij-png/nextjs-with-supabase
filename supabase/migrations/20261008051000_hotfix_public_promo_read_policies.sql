-- Repair public storefront reads without granting anon access to user profiles.
-- Production incident: a shared anon/authenticated SELECT policy had an admin
-- branch referencing public.profiles, which anon is not permitted to read.
-- Keep the existing admin-aware policy only for authenticated users.
alter policy "Readable promos" on public.promo_codes to authenticated;
alter policy "Readable stores" on public.stores to authenticated;

-- Anonymous browsing sees only live approved offers and active stores.
create policy "Anonymous read live promos"
on public.promo_codes for select to anon
using (
  approved = true and is_active = true
  and (expires_at is null or expires_at > now())
);

create policy "Anonymous read active stores"
on public.stores for select to anon
using (is_active = true);
