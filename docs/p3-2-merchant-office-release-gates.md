# P3.2 — Verified business multi-shop office

**State: draft development; NOT deployed to Supabase or production.**
Stacked on P3.1 PR #16, which in turn depends on P3.0 PR #15. P2 PR #14 is separate and unmerged. Use the existing Supabase plan; do not create paid branches or write production data.

## Screens
- `/merchant`: account's own verified businesses, each linking to its own shop/offer office.
- `/merchant/business/[id]`: authenticated, active member only. Show own business shops, products/services and promo statuses. Company status other than `verified` disables all management operations.
- Owner and manager can create shops/branches and withdraw their company's promo codes. Owner, manager and editor can add products, services and submit pending offers. No role can approve or re-enable offers. The existing administrator dashboard retains final control.

## Data and authorization model
The migration `20261013030000_p3_2_merchant_store_items_promos.sql` extends the P3.0/3.1 tables. Four narrow `SECURITY DEFINER` RPCs enforce JWT caller `auth.uid()`, active membership, role scope, verified company and shop ownership on **every write**. No request may decide its own role or bypass admin verification. Company/item/store composite keys from P3.0 prevent mismatched relationships.

1. `merchant_create_store`: creates a new branch linked to the caller's verified company. **Never assigns or claims an existing store.**
2. `merchant_create_item`: adds a product/service to one of the company's active branches.
3. `merchant_submit_promo`: validates a same-store item (or shop-wide promo), expiry and destination; **always inserts `approved=false`**.
4. `merchant_withdraw_promo`: owner/manager can set `is_active=false` only for owned offers; cannot approve or restore them.

The previously broad authenticated promo-insert policy is narrowed to verified business members submitting pending promos for their own active shop, or platform administrators. Pending/private promos become visible to the verified company's own active members via authenticated-only SELECT policy. Existing anonymous policies remain untouched. More comprehensive public disabled-store enforcement from P2 must be reviewed and released independently.

## Risk and acceptance gates
- [ ] Synthetic PostgreSQL 17 CI proves A/B company isolation, two branches under A, editor/manager/owner rights, revoked and suspended denials, foreign-item rejection, unauthorized direct promo INSERT denied, pending-only creation, withdrawal, and existing platform admin rights.
- [ ] App typecheck/lint/build and matching Vercel preview successful.
- [ ] Real Supabase Auth & Next.js server actions under browser session not yet verified; remains release blocker on current plan.
- [ ] Account suspension/revocation behavior and business ownership must be audited for real-world onboarding before release.
- [ ] Merge order: P2, P3.0, P3.1, P3.2 after independent release approvals, migration-history reconciliation and staged/controlled migration testing.
- [ ] Mobile iPhone smoke of merchant shop+offer management after approval. Confirm error handling, expiry/date, and UX before live.
- [ ] Production deployment/migrations require **explicit approval**; no real records created by these tests.

## Deferred features
No payments, merchant team invitations, company self-verification, edits to existing approved offer terms, bulk imports, stock/inventory, merchant approval rights, advanced analytics or automatic company/store claim. Avoid presenting these as working.
