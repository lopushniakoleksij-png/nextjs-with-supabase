update public.profiles
set role = 'user'
where role is null or btrim(role) = '';

alter table public.profiles
  alter column role set default 'user',
  alter column role set not null;

insert into public.profiles (id, email, role)
select u.id, u.email, 'user'
from auth.users u
on conflict (id) do update
set email = excluded.email;

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
