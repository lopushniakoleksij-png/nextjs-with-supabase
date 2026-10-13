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
 website_url text,
 affiliate_url text,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
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
 code text not null,
 title text, description text, destination_url text,
 expires_at timestamptz, submitted_by uuid references auth.users(id),
 approved boolean not null default false,
 is_active boolean not null default true,
 click_count bigint not null default 0,
 worked_count integer not null default 0,
 failed_count integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(store_id,code)
);
alter table public.promo_codes enable row level security;
create policy "P3 existing admin promos" on public.promo_codes
 for all to authenticated
 using (exists (select 1 from public.profiles p
   where p.id=auth.uid() and p.role='admin'))
 with check (exists (select 1 from public.profiles p
   where p.id=auth.uid() and p.role='admin'));
grant select,insert,update,delete on public.promo_codes to authenticated;

create policy "Submit or admin insert promos" on public.promo_codes
 for insert to authenticated with check (
   (submitted_by = auth.uid() and approved=false)
   or exists(select 1 from public.profiles p
     where p.id=auth.uid() and p.role='admin')
 );


-- The migration must NOT recreate/overwrite these prior public tables.
