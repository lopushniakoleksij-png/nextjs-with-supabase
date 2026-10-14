# Offqira public homepage — review and release gates

**Date:** 14 October 2026  
**Status:** draft review only. No production deployment, auth/security changes, database migration or merchant onboarding authorised.

## Intent

Brand the existing Promo Code 4 product as **Offqira** on its verified custom domain, `offqira.com`, without creating another app or changing trade/merchant data.

- Responsive homepage with new copy, product workflow *explicitly described as conceptual*, and a truthful empty state.
- The original Supabase approved/active/not-expired promotion query remains intact; existing `/go/[id]` and `/store/[slug]` destinations are retained.
- No fabricated merchants, pilot traction, users, business partnerships, investor promises, revenue or verified transaction statistics.
- The Merchant Office is stated as **not launched**; no unusable sign-up form or payment collection is advertised.
- A short, truthful early-stage investor status links to development; the business is not yet incorporated.
- New brand metadata points to the connected `offqira.com` domain, retaining `FingerprintInit` and other app routes.

## Before this PR can be merged

- [ ] GitHub Actions `verify`: typecheck, lint and Next build PASS for latest head.
- [ ] Vercel preview READY and publicly inspectable by owner through their authenticated Vercel account.
- [ ] iPhone Safari portrait: header, navigation, hero, product concept, offer empty state and cards have no overflows; links/tap targets work.
- [ ] Desktop responsive review, keyboard/focus links, contrast, and no fabricated success metrics.
- [ ] **P2/security gate:** Known disabled-parent-store visibility/click/vote defect is held in PR #14 and is NOT fixed by this visual-only PR. A decision to deploy this PR with the original read path requires explicit security review; do not imply a promotional offer is fully verified by this PR alone.
- [ ] **P3/merchant gate:** Draft PRs #15–#18 are separate. Do not link to their unshipped merchant routes, offer an active merchant signup, charge fees, or claim an operating business portal.
- [ ] Brand rights: UK IPO search is preliminary, not legal clearance. Review `Offqira` trademark and any potentially conflicting unregistered rights before public-facing brand promotion.
- [ ] SEO/canonical: `app/layout.tsx` points at `https://offqira.com`. Audit old `NEXT_PUBLIC_SITE_URL` and `robots.ts`/`sitemap.ts` before production promotion; do not change environment variables silently.
- [ ] Production domain (already attached) still serves valid HTTPS; existing Vercel alias and password-recovery/auth routes remain functional after any eventual release.
- [ ] User explicitly authorises any future merge/deployment. No auto-merge.

## Preview acceptance

1. Load PR preview on a real iPhone, scroll to all sections, confirm 0 real promotions produces a clearly honest empty state.
2. Ensure `Explore live offers` jumps to the offers area and does not imply offers exist.
3. Verify `For businesses` says merchant applications are closed and describes planned functions accurately.
4. Verify project progress status and GitHub link work, including new tab security `rel=noopener noreferrer`.
5. On disposable/test data *only*, check the original `/go/[id]`, store link and approved offer card render. Avoid inserting fake offers in production.

## Separate next-stage work

- P2 and P3 safe release decisions are not solved by visual branding.
- Investor pack and external contact channel require a real, owned business email; do not publish a borrowed business mailbox.
- A separate work item should replace starter Open Graph assets and review sitemap/robots once branding/IP are approved.
