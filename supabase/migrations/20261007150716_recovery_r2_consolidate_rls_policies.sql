
drop policy if exists "Public can read active stores" on public.stores;
drop policy if exists "Admins manage stores" on public.stores;

create policy "Readable stores"
on public.stores
for select
to anon, authenticated
using (
  is_active = true
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

create policy "Admins insert stores"
on public.stores
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

create policy "Admins update stores"
on public.stores
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

create policy "Admins delete stores"
on public.stores
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

drop policy if exists "Public can read live promos" on public.promo_codes;
drop policy if exists "Authenticated users can submit promos" on public.promo_codes;
drop policy if exists "Admins manage promos" on public.promo_codes;

create policy "Readable promos"
on public.promo_codes
for select
to anon, authenticated
using (
  (
    approved = true
    and is_active = true
    and (expires_at is null or expires_at > now())
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

create policy "Submit or admin insert promos"
on public.promo_codes
for insert
to authenticated
with check (
  (
    submitted_by = (select auth.uid())
    and approved = false
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

create policy "Admins update promos"
on public.promo_codes
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

create policy "Admins delete promos"
on public.promo_codes
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

drop policy if exists "No direct client vote access" on public.promo_votes;
create policy "No direct client vote access"
on public.promo_votes
for select
to anon, authenticated
using (false);

drop policy if exists "No direct client click access" on public.promo_clicks;
create policy "No direct client click access"
on public.promo_clicks
for select
to anon, authenticated
using (false);
