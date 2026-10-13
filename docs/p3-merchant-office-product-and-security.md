# Promo Code 4 — Merchant Office P3 v0.1

Status: **DESIGN / ISOLATED IMPLEMENTATION; NOT PRODUCTION APPROVED**.
Product decision approved: **one verified company can manage multiple stores, locations or branches**. Every business must be isolated from every other business.

## Product and account hierarchy
- **Platform administrator:** existing `profiles.role = 'admin'`, solely responsible for merchant verification, store assignment/approval, promotion moderation, suspension and platform-wide inspection. Preserve the original admin account and all existing admin gates.
- **Merchant organization:** legal business account (shop, company, professional services firm), distinct from a login. States: `pending`, `verified`, `suspended`, `rejected`. A pending application has **no automatic publishing authority**.
- **Merchant member:** existing Supabase Auth user, linked to an organization with role `owner`, `manager` or `editor`, membership state `invited`, `active` or `revoked`. A person may belong to multiple businesses; authorization always resolves the **selected organization** server-side.
- **Store/branch:** every existing `public.stores` row is retained and starts with `merchant_organization_id = NULL`; a verified business can eventually own several store rows. A store belongs to *at most one* organization. Assigning legacy stores requires administrator verification, not self-claimed brand ownership.
- **Product or service:** `merchant_items` with `item_type = product | service`, scoped to exactly one business and one of its stores. This is a catalogue of offer subjects, **not** a shopping cart, inventory, payment or checkout system.
- **Promo code:** created for one store and optional product/service. New and materially edited offers remain **pending** until administrator approval. Customers browse, click and vote without access to the merchant office.

## Merchant Office mobile-first screens
1. **Apply for business account:** legal/trading name, contact, website, service category, company number if applicable, request verification. Do not elevate `profiles.role`.
2. **Choose business:** one account may be a member of more than one organization; tenant identifier never trusted without database membership check.
3. **Overview:** offers pending/approved/expired, aggregate referral clicks by stores the member may access; never expose other businesses' data.
4. **Stores & branches:** verified business locations; new branch requires explicit assignment and optional administrator verification.
5. **Products & services:** add item names, types, descriptions, links, and assign to owned store.
6. **Promotions:** create `pending` promo with product/service, code, offer terms, destination, expiry, optional start date; edits to published details return to pending.
7. **Team:** owners manage invitations eventually; no member may change their own role or claim another business. Email invite token with expiry, revocation and audit logging required.
8. **Analytics:** per-store clicks and worked/failed feedback; aggregated only. Avoid exposing personal fingerprints.
9. **Admin merchant review:** approve/reject/suspend organizations, review store ownership evidence, view cross-organization audit, moderate submitted promotions.

## Explicit v1 safeguards
- No automatic approval or public listing from registration.
- Merchant accounts **cannot** grant themselves `admin`, verify a business, claim an existing store by slug, or approve promos.
- Never expose `destination_url`, contact details, user IDs or vote fingerprints in unauthorized data responses.
- Organization identity/role is derived from authenticated Supabase user and database membership, never from client form parameters or `profiles.role = 'merchant'`.
- Cross-business ownership constraint at database level for store/product associations.
- Merchant can read only its own verified company's private items; member records readable only by self or platform admin until invitation workflow exists.
- Revoking membership or suspending a business removes merchant-office rights immediately.
- Existing anonymous public storefront and platform-admin routes remain unchanged in the **foundation stage**.
- An admin creates or assigns organization/store membership in v0.1; merchant self-onboarding, team write actions and promo writer RPCs are future gated steps.
- All production migrations require deliberate approval; the P3 PR stays DRAFT. P2 disabled-store public visibility must be resolved independently before P3 can be released.
- Supabase plan stays unchanged: no paid branch, no new project, no production SQL.

## Rollout sequence and acceptance gates
| Gate | Deliverable | Required evidence |
| --- | --- | --- |
| P3.0 | This specification + additive SQL model + RLS | Disposable PostgreSQL role/tenant-isolation tests |
| P3.1 | Controlled business application + platform verification | Pending business cannot self-verify; admin can approve |
| P3.2 | Secure merchant access + organization selector + mobile shell | Real Supabase Auth-backed tests; multi-tenant access revoked/blocked |
| P3.3 | Merchant store/branch management and ownership checks | Cannot claim another business's stores; admin controls assignment |
| P3.4 | Product/service catalogue and offer submission | Server-action/RPC permission tests; catalog association constraint |
| P3.5 | Admin review and public publication after approval | End-to-end tests across owner, manager, editor, visitor |
| P3.6 | Click reporting, abuse controls, audit trail, invitation/revocation | Cross-tenant and failure-mode tests, mobile acceptance, release sign-off |

## Dependencies, release restrictions and migration path
- P3 proposal branch is **independent of the unmerged P2 PR**, based on current production `main`; the PR MUST NOT merge ahead of P2 without a dedicated compatibility review.
- The foundation migration is **additive**: creates merchant tables, adds nullable `stores.merchant_organization_id`, and does not mutate existing store, promo or profile records.
- Tables have RLS enabled and no anonymous grants. Signed-in merchants cannot write these tables at this stage; admin-only writes are database-checked.
- The `merchant_items` composite FK ensures an item's store belongs to the same merchant organization. Individual stores can be represented as branches without new physical branch rows.
- Existing signup remains a regular `user`; registering a Supabase Auth user must NEVER automatically create a verified business or assign ownership.
- Before production: combine/review Supabase migration histories, run a real Supabase integration harness or formally assess the lack of native branching on the existing plan, review operational rollback and obtain explicit approval.
