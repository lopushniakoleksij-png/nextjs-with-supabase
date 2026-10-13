-- P3.3 disposable local Supabase stack ONLY.
-- Production Vercel/Supabase project must never be a SQL target.
-- Reconstructs the pre-existing profile table missing from the R1 repo history.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'user',
  email text
);
alter table public.profiles enable row level security;
