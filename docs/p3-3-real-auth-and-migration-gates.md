# P3.3 integration gate — real local Auth and P2/P3 migration ordering

**Release policy: NO GO until exact-head CI is green, local Auth E2E passes and explicit production approval is obtained.** This PR introduces only CI fixtures/tests and does not grant production release permission.

## Why this gate exists
- P2 PR #14 and P3.0/#15, P3.1/#16 and P3.2/#17 are all independent draft/stacked branches.
- P3.2 expects the `Submit or admin insert promos` policy created by the recovered R2 historical migration. The production main branch alone omits part of this recorded history.
- P2 requires inactive-store offers to be invisible, and the website must not expose disabled-store promo click/vote RPCs.
- Previous synthetic role tests simulate JWT sub claims. P3.3 must test real local GoTrue Auth user sessions against the Next.js app, without a paid Supabase branch.

## Pinned, exact chronological local migration order
Run on a disposable *local* Supabase CLI Postgres container:
1. Create the existing pre-R1 profiles table as a **CI-only baseline fixture** (not a production migration).
2. `20261006101203`, `20261006101233`, `20261006101302` from P3.2 branch.
3. `20261007143339`, `20261007150716`, `20261008041424` recovered historical migrations from **P2 PR #14 commit `c0e08f1a`**.
4. Idempotent source-only `20261008051000` hotfix from P3.2 branch.
5. `20261012230000` P2 active-store policy and click/vote restrictions from same pinned P2 commit.
6. `20261013010000` P3 organizations/stores/memberships/items; `20261013020000` pending applications and admin review; `20261013030000` merchant scope and pending-offer submission.
7. Install **test-only auth.users trigger** for automatic profiles on GoTrue account creation. This mirrors the hosted trigger; no production schema is modified.

The baseline is reconstructed, not assumed complete. The migration replay is not a claim that production migration history has been altered, merged or synchronized.

## Browser acceptance paths
Run only against `http://127.0.0.1:54321` local Supabase and `http://127.0.0.1:3333` Next.js:
- Anonymous visitor cannot access Merchant Office.
- GoTrue signs in test identities; ordinary user goes to merchant office; admin remains on dashboard.
- A/B submit separate applications through real Next.js server actions; privacy forbids cross-applicant visibility.
- Platform administrator approves businesses through protected review forms; each gains exactly one verified organization/owner membership.
- Company A owner creates its own shop, product/service and pending promo. Company B cannot access Company A dashboard or create an item in Company A's shop.
- Pending promotions are reviewed by existing platform admin and become public only after approval.
- No production user records, paid projects/branches, live DB changes, or reused user credentials.

## Go/no-go threshold
**Go for further staging review**, not production: all real local stack setup, SQL replay and real browser steps successful at exact GitHub SHA, along with existing tenant-isolation and build checks.
**No-go** if any of those fail, or if the local stack cannot start under available GitHub Actions resources. An incomplete CI run is never evidence of successful Auth E2E.

## Remaining eventual production gates
Real users on the hosted Supabase plan, platform-admin business ownership verification procedure, permission review, SQL rollback plan for combined P2/P3 migrations, iPhone usability, rate limits, abuse controls, and explicit authorized controlled cutover. No automatic branch upgrade, merge or hosted schema write.
