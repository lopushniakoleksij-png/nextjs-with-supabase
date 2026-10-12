alter policy "Readable promos" on public.promo_codes to authenticated;
alter policy "Readable stores" on public.stores to authenticated;

create policy "Anonymous read live promos"
on public.promo_codes for select to anon
using (
  approved = true and is_active = true
  and (expires_at is null or expires_at > now())
);

create policy "Anonymous read active stores"
on public.stores for select to anon
using (is_active = true);
