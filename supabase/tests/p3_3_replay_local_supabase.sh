#!/usr/bin/env bash
set -euo pipefail
# P3.3: local Supabase only. Never target linked/remote production databases.
if [[ "${P3_CI_LOCAL_ONLY:-}" != "yes" ]]; then
  echo "Refusing to run outside disposable local P3.3 test." >&2
  exit 1
fi
export PGHOST=127.0.0.1 PGPORT=54322 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=postgres
if ! pg_isready -q; then
  echo "Local Supabase PostgreSQL not available on port 54322." >&2
  exit 1
fi
psql -v ON_ERROR_STOP=1 -Atqc "select current_database()" | grep -Fx postgres

# P2 source is pinned by the separate GitHub checkout under ./p2-verified.
for version in 20261007143339 20261007150716 20261008041424 20261012230000; do
  mapfile -t files < <(find p2-verified/supabase/migrations -maxdepth 1 -name "${version}_*.sql" | sort)
  if [[ ${#files[@]} -ne 1 ]]; then
    echo "Missing or ambiguous pinned P2 migration ${version}" >&2; exit 1
  fi
  cp "${files[0]}" "supabase/migrations/"
done

# Only local test stack: source migrations are in the workspace but not
# auto-applied by Supabase start. Apply audited history in chronological order.
psql -v ON_ERROR_STOP=1 -f supabase/tests/p3_3_profiles_local_bootstrap.sql
for version in \
  20261006101203 20261006101233 20261006101302 \
  20261007143339 20261007150716 20261008041424 \
  20261008051000 20261012230000 \
  20261013010000 20261013020000 20261013030000
do
  mapfile -t files < <(find supabase/migrations -maxdepth 1 -name "${version}_*.sql" | sort)
  if [[ ${#files[@]} -ne 1 ]]; then
    echo "Missing or ambiguous chronological SQL ${version}" >&2; exit 1
  fi
  echo "Applying locally ${version}"
  psql -v ON_ERROR_STOP=1 -f "${files[0]}"
done

# Real GoTrue signup should generate the default 'user' profile, like hosted
# Supabase where handle_new_user trigger is configured.
psql -v ON_ERROR_STOP=1 <<'SQL'
do $trigger$
begin
 if not exists (select 1 from pg_trigger
   where tgrelid = 'auth.users'::regclass
   and tgname = 'p3_ci_on_auth_user_created') then
  execute 'create trigger p3_ci_on_auth_user_created
   after insert on auth.users for each row
   execute function public.handle_new_user()';
 end if;
end;
$trigger$;
SQL

# Assert the final P2 + P3 schema on the real Supabase database before tests.
psql -v ON_ERROR_STOP=1 <<'SQL'
do $check$
begin
 if not exists (select 1 from pg_policies where schemaname='public'
    and tablename='promo_codes' and policyname='Anonymous read live promos'
    and qual ilike '%stores%') then
   raise exception 'P2 active-store public policy missing';
 end if;
 if not exists (select 1 from pg_proc
   where oid='public.merchant_submit_promo(uuid,uuid,uuid,text,text,text,text,timestamptz)'::regprocedure) then
   raise exception 'P3.2 merchant submission function missing';
 end if;
end $check$;
SQL
echo "Disposable local Supabase P2/P3 migration order: PASS"
