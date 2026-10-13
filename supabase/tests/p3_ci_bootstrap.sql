-- Disposable P3 CI harness ONLY. Never apply to Supabase production.
create schema auth;
create role anon nologin;
create role authenticated nologin;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id), role text not null default 'user'
);
alter table public.profiles enable row level security;
create policy "P3 own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
grant select on public.profiles to authenticated;

create table public.stores (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text not null unique,
 is_active boolean not null default true
);
alter table public.stores enable row level security;
create policy "P3 existing admin stores" on public.stores
 for all to authenticated
 using (exists (select 1 from public.profiles p
   where p.id=auth.uid() and p.role='admin'))
 with check (exists (select 1 from public.profiles p
   where p.id=auth.uid() and p.role='admin'));
grant select,insert,update,delete on public.stores to authenticated;

create table public.promo_codes (
 id uuid primary key default gen_random_uuid(),
 store_id uuid not null references public.stores(id),
 code text not null, approved boolean not null default false,
 is_active boolean not null default true
);
alter table public.promo_codes enable row level security;
create policy "P3 existing admin promos" on public.promo_codes
 for all to authenticated
 using (exists (select 1 from public.profiles p
   where p.id=auth.uid() and p.role='admin'))
 with check (exists (select 1 from public.profiles p
   where p.id=auth.uid() and p.role='admin'));
grant select,insert,update,delete on public.promo_codes to authenticated;

-- The migration must NOT recreate/overwrite these prior public tables.
