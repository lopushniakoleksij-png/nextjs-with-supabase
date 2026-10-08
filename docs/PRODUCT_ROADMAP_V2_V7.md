# Promo Code 4 — Production Roadmap (V2–V7)

**Status:** Execution baseline, 8 October 2026. **Default release mode:** draft PR + canonical preview; no automatic merge or production promotion.

## Product mandate
Build a credible, phone-first UK promotion discovery platform that connects verified retailer offers to consumers and generates **measurable net affiliate contribution**, without fabricating discounts, merchants, votes, earnings, or conversion metrics.

**Source of truth:** Promo Supabase project (canonical stores, promo_codes, promo_clicks, promo_votes, profiles). No separate synthetic offer store. Approved is an administrative status, **not proof that a coupon works**; community reliability must say "not enough votes" when evidence is low.

## Customer segments and jobs
1. **Shoppers**: find active codes, inspect offers and retailer terms, copy a code, navigate to the merchant, and report whether the offer worked.
2. **Merchants / administrators**: submit, review, verify, publish, retire and analyse offers with auditable merchant destinations.
3. **Business owner**: track approved inventory, valid click paths, merchant outreach, paid affiliate conversions, revenue and actual contribution margin.

## IA and screen architecture

| Route | Purpose | Release requirement |
| --- | --- | --- |
| `/` | High-trust brand introduction, discover/search/sort approved offers, clear empty state | Search real data only; mobile first |
| `/stores` | Search and discover active UK merchants | No inactive/phantom stores; links to correct store |
| `/store/[slug]` | Merchant detail, live codes, evidence of validity, click and vote | No expired/unapproved codes; 404 for unknown/inactive |
| `/saved` | Browser-local saved live deals | Transparent device-local storage; no account sync claim |
| `/auth/login`, `/auth/sign-up` | Existing identity | Functional links; no exposure of protected routes |
| `/dashboard`, `/admin/stores`, `/admin/promo-codes` | Admin inventory and review | Maintain existing role isolation |
| `/about` | Honest disclosure of offer approval, community voting, affiliate relationships | No false promise of independent tests |

**Shared UI:** one header/nav/footer; mobile navigation; 44px+ touch targets; accessible inputs and focus indicators; responsive content and clear errors. Never place the only useful interaction below excessive mobile hero content.

## Roadmap / acceptance gates

### V2 — Design system + architecture (P0)
- Shared public chrome, typography, spacing, accessible components and realistic error/empty/loading states.
- Homepage navigation, search, responsive deal cards and trustworthy copy.
- Routes connected to actual DB records, not visual mocks.
- **Gate:** typecheck, lint, build, canonical Vercel preview READY; manual iPhone Safari viewport and keyboard review.

### V3 — Customer journeys (P0)
- Store directory, store detail, search, live offers, saved deals, code copy, outbound redirect and worked/failed voting.
- Test `browse → search → merchant → copy → /go/id → click ledger → vote` with a temporary isolated approved test offer; delete test records afterwards.
- Browser-local favourites must fail safely when storage disabled; no telemetry or login dependency.
- **Gate:** E2E route tests and QA on iPhone + desktop; no fabricated success metrics.

### V4 — Merchant supply & code quality (P0)
- Real UK merchants only with permitted listings, URL/destination review, dated last-checked evidence, expiration and ownership checks.
- Separate approval from independent verification; implement report-expired and moderation workflow.
- Target pilot: **at least 5 consenting/approved merchants and 20 currently valid offers** (business target, not current state). Seed nothing until verified.
- **Gate:** every featured code has verified origin, tested destination, accurate terms and scheduled recheck.

### V5 — Affiliate and business economics (P1)
- Documented affiliate eligibility, compliant disclosure, tracked outbound click ID, conversion/payout ingestion via approved providers.
- Conversion attribution by store/offer and source; understand reconciliation limits and reversal/refund windows.
- KPI dashboard: qualified clicks, conversion %, approved commissions, refunds, earned vs paid commissions, hosting/data cost, gross contribution and net contribution.
- **Gate:** successful reconciled **real** conversion/payout test with lawful integration. **No projected income reported as earned.**

### V6 — Security and reliability (P1)
- RLS and grants: public active/approved read only, auth admin mutation only, click/vote RPC abuse controls, rate limiting, anti-fraud policies.
- Canonical Vercel environment, single Git connection, branch protections, monitoring, restoration instructions, SEO/canonical/robots, privacy/cookies, UK affiliate disclosure and accessibility audit.
- Runtime error visibility and incident recovery tested. Performance budgets on low-end phone and throttled network.
- **Gate:** zero blocking security issues, tests green, production smoke tests, rollback ready.

### V7 — Launch / promotion gate
Launch only when V2–V6 checks are evidenced, meaningful pilot inventory exists and click → conversion → payout is observable. Start with limited beta, instrument search failure and exit paths, iterate weekly; do not buy traffic into an empty marketplace.

## Release discipline
1. Every stage is a separate reviewed change set, tested via GitHub CI and canonical Vercel preview.
2. Never promote a mere READY build without HTTP and phone-user checks.
3. Database migrations source controlled and tested, no privilege expansion to workaround errors.
4. No changes to production auth/RLS/user records without exact necessity and rollback.
5. Protect `main` and the existing production deploy until explicit release approval.
6. Duplicate failing Vercel project and 403 observability access remain infrastructure cleanup work.

## Current evidence baseline
- PR #3 restored anonymous public promo access; 10 user profiles preserved.
- PR #4 mobile-first draft preview and CI passed before V2 continuation.
- Current production database: **0 stores / 0 offers / 0 votes / 0 clicks**. The storefront empty state is factual, not a defect.
- No real affiliate commissions or customer traction are verified.
- Vercel runtime logs currently not available to this connector due to access restrictions.

## Success definition
Commercial success means **positive, reconciled contribution**, not just a styled site or inflated click totals. Prioritize merchant supply, live working promo redemption, reliable conversion evidence and users finding successful savings.
