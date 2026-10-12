-- Disposable CI pre-R1 environment only. Mimics required Supabase auth roles
-- and pre-existing profiles table. Never apply this fixture to production.
create schema if not exists auth;
create role anon nologin;
create role authenticated nologin;

create table auth.users (
  id uuid primary key,
  email text
);

create or replace function auth.uid() returns uuid
language sql stable
as $auth_uid$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')
  )::uuid
$auth_uid$;

grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to authenticated;

create table public.profiles (
  id uuid primary key,
  email text,
  role text
);
alter table public.profiles enable row level security;
-- CI adds no administrator to the live project and creates no real auth.users.
