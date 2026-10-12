#!/usr/bin/env bash
set -euo pipefail

# Only run on the disposable PostgreSQL GitHub Actions database.
if [[ "${PGDATABASE:-}" != "p2_history_replay_ci" ]]; then
  echo "Refusing migration history replay outside p2_history_replay_ci" >&2
  exit 1
fi
if [[ "${PGHOST:-}" != "localhost" && "${PGHOST:-}" != "127.0.0.1" ]]; then
  echo "Refusing non-local PostgreSQL host" >&2
  exit 1
fi

psql -v ON_ERROR_STOP=1 -f supabase/tests/p2_history_bootstrap.sql
for migration in \
  20261006101203_recovery_r1_create_promo_domain \
  20261006101233_recovery_r1_harden_profiles \
  20261006101302_recovery_r1_rls_and_rpcs \
  20261007143339_recovery_r1_add_submitted_by_index \
  20261007150716_recovery_r2_consolidate_rls_policies \
  20261008041424_hotfix_public_promo_read_policies \
  20261008051000_hotfix_public_promo_read_policies \
  20261012230000_p2_public_promos_require_active_store
do
  file="supabase/migrations/${migration}.sql"
  test -f "$file" || { echo "Missing recorded SQL $file" >&2; exit 1; }
  echo "Replay $migration"
  psql -v ON_ERROR_STOP=1 -f "$file"
done

psql -v ON_ERROR_STOP=1 -f supabase/tests/p2_disabled_store_visibility.sql
psql -v ON_ERROR_STOP=1 -f supabase/tests/p2_history_auth_fixture.sql
psql -v ON_ERROR_STOP=1 -f supabase/tests/p2_lifecycle_flow.sql
echo "P2 chronological migration and role tests: PASS"

# Never execute the emergency rollback against a persistent database.
psql -v ON_ERROR_STOP=1 -f supabase/rollback/20261012230000_p2_restore_prechange.sql
psql -v ON_ERROR_STOP=1 -f supabase/tests/p2_rollback_verify.sql
echo "P2 rollback rehearsal and original security grants: PASS"
