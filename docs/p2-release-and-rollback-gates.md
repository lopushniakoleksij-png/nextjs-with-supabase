# P2 release and rollback gates — current Supabase plan

Status: **DRAFT / NO PRODUCTION PROMOTION AUTHORIZED**.

## Objective
Prevent a disabled store from exposing its approved promos, accepting votes or recording clicks. Scope is the public homepage, promo SELECT RLS policies and public tracking RPCs. Admin profile, identities and production data are not changed by this proposal.

## Historical migration provenance (read-only Supabase source)
Supabase's `supabase_migrations.schema_migrations` stores SQL in `statements[1]`. We retrieved the exact historical SQL for:
- `20261007143339_recovery_r1_add_submitted_by_index.sql`
- `20261007150716_recovery_r2_consolidate_rls_policies.sql`
- `20261008041424_hotfix_public_promo_read_policies.sql`

All three are restored under `supabase/migrations/`, using the exact production-recorded version, name and SQL body (apart from trailing whitespace). The current repository additionally contains `20261008051000_hotfix_public_promo_read_policies.sql`, an idempotent source-only hotfix which is **not** among the recorded production migration versions. Do not rename an applied migration to match this later source file.

Existing R1 source files for `20261006101203` and `20261006101302` differ from the recorded SQL in formatting/spacing; preserve their existing source files. `20261006101233` matches apart from whitespace.

## Verified tests, without a paid Supabase development branch
- Next.js typecheck/lint/build.
- Disposable PostgreSQL 17 with synthetic row-level security model, run historical migration + P2 SQL assertions.
- Disposable PostgREST HTTP tests for anonymous, regular-user, admin, pending, approved, expired and deactivated state transitions.
- Chronological migration-history replay in a second disposable PostgreSQL 17 DB: all R1/R2/hotfix SQL in version order, P2 forward migration, RLS and workflow tests, then the guarded emergency rollback and verification.
- These are **not** tests against live Supabase Auth or the deployed server actions. This distinction remains a release limitation.

## Live preflight (read only)
Before any migration, verify independently:
1. The exact GitHub head SHA, all CI tests, and Vercel preview are READY.
2. `supabase_migrations.schema_migrations` versions and policy topology are unchanged.
3. `public.promo_codes` has exactly the expected 5 policies. `Anonymous read live promos` has role `anon`; `Readable promos` has role `authenticated`; no unexpected extra SELECT policies exist.
4. Both `public.record_promo_click(uuid,text)` and `public.record_promo_vote(uuid,text,text)` remain SECURITY DEFINER with their expected signatures. Capture function definitions and ACLs.
5. Confirm admin role count and unchanged stores/promo counts. Never assume counts remain zero.
6. Confirm production URL, deployment identity and rollback Vercel deployment ID.

## Deployment order (after explicit authorization)
1. Apply the reviewed **forward** migration using Supabase migration tooling; never use ad hoc destructive SQL, and abort if the policy-topology guard fails. Apply database restrictions first so the older public site cannot leak promos from disabled stores.
2. Validate security policies, function ACLs and real anonymous/authenticated reads. Check regular user cannot approve, and admin still sees pending promos.
3. Merge/promote the matching Next.js change once CI and production migration are validated.
4. Smoke test public home, individual store pages, approved/expired/deactivated promo handling, click/vote endpoints, and admin. Prefer dedicated staging; on current plan, a production write test needs separate explicit approval.
5. Monitor deployment and database errors. Halt promotion if any gate fails.

## Incident recovery — deliberate and gated
- **Preferred:** Do not remove the stricter RLS. Roll back the website to the previously READY deployment; disable affected promo records if necessary. Preserve P2 policy/RPC security.
- **Last resort ONLY with explicit approval:** After capturing current policy/RPC definitions and checking the migration has been applied, run `supabase/rollback/20261012230000_p2_restore_prechange.sql` against the intended environment. The script restores the original policy filters and the exact pre-P2 production RPC definitions. It intentionally **reintroduces** the known disabled-store visibility gap; do not run automatically or during normal releases.
- A rollback of the policy/RPC definitions **does not reverse a migration-history record**. Document reversal separately; never delete or edit Supabase migration history casually.
- Always verify admin authority, public restrictions, runtime, and data counts after incident response.

## Current limitation
Supabase rejected temporary branching with `Branching is supported only on the Pro plan or above`. The user explicitly chose to stay on the existing plan. No additional Supabase project, plan upgrade, paid resource or live test data is authorized. Keep PR #14 draft until an explicit release decision is made after reviewing residual integration risk.
