# Promo Code 4 P2 production go/no-go — 13 October 2026

**Decision: NO-GO for production promotion today.** This is a release-readiness decision, **not** a finding that the patch's tested behavior is broken. Do not merge draft PR #14, apply its migration to Supabase production, modify credentials, or seed real stores/offers based on this document.

## Release candidate
- GitHub: PR #14, branch `fix/p2-disabled-store-visibility-20261012`
- Evidence-bearing head at review: `4580033e272895464609e1cb40f20de6bb1d5bd3`
- GitHub checks: `verify`, `p2-database-visibility`, `p2-history-replay` all successful at that head
- Exact-head Vercel preview: `dpl_Eq4kbBaZ8ZYGRQHnDFEhTjiYAZSh`, READY
- Verified production baseline: Vercel deployment `dpl_4VVMDAaCyCBTE5rDnYAJ9X6zefBc`, commit `77788cfc65075aa80a0ccb6cdb63c7dd5b5a6521`, READY

## Gates already closed
1. **Migration provenance**: Recovered the original bodies of all three missing applied Supabase migration files from `supabase_migrations.schema_migrations.statements[1]`. Never claim the repository's extra `20261008051000` source-only migration is recorded as applied in Supabase.
2. **Production preflight is read only**: one administrator, zero stores, zero promo codes, zero clicks/votes as of the review; 5 promo policies with expected roles; function definitions and ACLs unchanged.
3. **Reproducibility**: CI replays historical migrations in order on disposable PostgreSQL 17, applies P2, validates RLS and role workflows, and verifies a guarded restoration of the pre-P2 policies and RPC definitions.
4. **Actual public app routes**: CI runs the real Next.js server against loopback-only PostgREST. It checks home listings, active/disabled store pages, approved/expired/pending visibility, `/go` redirects, and immediate suppression after store deactivation.
5. **Preview and checks**: All jobs green and candidate preview READY. No Supabase production schema/data changes or app production release.

## Open decision-critical gaps
1. **Supabase Auth-backed server actions**: The disposable API suite uses signed synthetic JWTs, not an isolated Supabase Auth instance with real browser sessions, refresh tokens, CSRF/form submissions and Next.js server actions for `createStore`, `addPromoCode`, `approvePromo` and `rejectPromo`. These are not yet E2E accepted.
2. **Contributor workflow is not a released interface**: `app/dashboard/layout.tsx` calls `requireAdmin()`. Thus `/dashboard/add` is available only to admins, but `addPromoCode` and the database INSERT policy deliberately allow any authenticated user to submit an unapproved promo. The action redirects to `/dashboard/promo-codes`, also admin-only. Do not describe ordinary-user web submission as working. Decide separately whether ordinary users should be offered a submission UI or whether this is intended to be admin-only in v1. **Do not relax the admin route guard** to solve this.
3. **Real Supabase isolated branch unavailable**: Supabase rejected creation on this plan (Pro needed). User explicitly chose the existing plan; do not incur additional charges or create another staging project.
4. **Rollback operational exposure**: The guarded SQL rollback restores the original policy/RPC behavior and therefore *reintroduces the known disabled-store promo exposure*. Prefer leaving the restrictive DB gate in place and rolling back the website if an application incident occurs. Any SQL rollback needs a separate human approval and post-rollback exposure assessment.
5. **Production cutover coordination**: A merge to `main` can auto-trigger Vercel production before/independent of the database migration. Schedule controlled DB-first cutover only after explicit authorization; never merge first as an experiment. Production-level promotion and post-migration monitoring were not executed.

## Conditional release path (requires distinct authorization)
- Re-run the read-only production preflight and record current deployment SHA, policies, ACLs, admin and data counts.
- Freeze the exact PR SHA and verify full GitHub CI plus Vercel preview.
- Decide whether public user promo submissions are in v1 scope. The existing admin-only path can be tested as an admin workflow; do not claim general-user flow is complete.
- Obtain explicit authorization for **production database migration and merge**, including acknowledgement that real Supabase Auth-backed E2E tests remain missing on this plan. If unwilling to accept this risk, keep NO-GO.
- Apply reviewed P2 database restrictions first under a controlled production change window, check grants/admin access, then promote the matched app code and verify live 200/404/redirect behavior.
- Stop the release if any policy topology, permissions, API query or auth check differs from the preregistered baseline. Do not create actual test offers unless separately approved with a cleanup plan.

## Next safe task while release is NO-GO
Prepare an isolated, nonproduction regression test for admin form actions or document a phone-only supervised acceptance checklist for an explicitly approved controlled live test. Both routes should preserve admin permissions, minimize data writes and avoid billable services.

**This document does not authorize release.** Review of residual risk and distinct release sign-off are required.
