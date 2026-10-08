# V3 Customer Journey QA — protected preview runbook

**Release policy:** PR #4 remains draft until every blocking gate below is proven. READY deployment is a build status, not application availability. Never insert real/synthetic merchant records on production as a convenience.

## Recorded automated evidence (8 October 2026)
- CI run #73 on commit `2cde6e15`: TypeScript, ESLint, seven Node regression tests, Next production build all passed.
- Seven tests exercise insensitive search (merchant/title/code/description), non-mutating sorting, missing expiration, Wilson lower-bound ranking (protects against a single positive vote outranking broad evidence), unrated codes, local saved-ID validation/deduplication, and storage-disabled fallback.
- Read-only `anon` Supabase role query confirms public stores and approved offers can be read; access to `profiles` remains forbidden.
- Production still contains zero published stores, offers, votes and clicks.
- **Not yet proven:** actual authenticated-preview HTTP navigation, clipboard, new-tab redirect, click ledger, valid vote ledger, admin flow, visual regression on iPhone, affiliate conversion.

## HTTP smoke check (side-effect-free)
Once the exact deployed preview is accessible from an authorized session, use:

```shell
npm run smoke:public -- https://EXACT-PREVIEW.vercel.app
```

The script verifies `/`, `/stores`, `/saved`, `/about` (200 + expected heading); missing store (404); malformed `/go/not-a-uuid` (307/308 to own homepage); invalid vote (400). It must not run valid click/vote traffic or fabricate ledger evidence. If Vercel protection returns 401/403, fix project/team authorization and rerun, not treat it as pass. Do not run against a server lacking explicit permission.

## Manual iPhone Safari QA
1. Sign out and open preview on Wi-Fi and on mobile data. Confirm no generic server error; wait for screen to finish.
2. Homepage: logo, primary navigation, mobile bottom navigation, honest zero-offer state, search and sort controls, no horizontal scroll or obstructed input keyboard.
3. Tap Stores: active directory only, valid link; zero inventory shows informative empty state.
4. Saved: no false account-sync claim; empty state works. When a valid controlled offer exists, save → navigate away → return → refresh → unsave. Browser storage blocked must not crash the app.
5. About: no unsupported verification promise; affiliate disclosure exists; proceed to account and sign-in.
6. Store detail: unknown/inactive slug returns 404; approved/unexpired offer only; expiry UTC formatting and vote transparency are legible.
7. Accessibility: zoom to 200%, VoiceOver labels, focus outline, 44px targets, iPhone safe-area bottom nav.
8. Capture exact preview URL, commit SHA, device/browser, 5 screenshots (home, store directory, saved, merchant detail, failure handling), and PASS/FAIL for every step.

## Controlled valid promo smoke test — still blocked
**Prerequisites:** Explicit staging/test tenant or documented rollback-only transaction in production; approved test merchant destination owned/controlled by operator, no third-party affiliate attribution, no email outreach.

Test `home → search → store → save → use code → tracked redirect → click ledger +1 → worked vote → duplicate vote ignored → failure vote from independent fingerprint → invalid/expired/unapproved hidden`; remove any test rows and assert database counters return to baseline. Use separate browser sessions where meaningful.

Never describe an unrun click/vote test as a pass; earlier Recovery R1 testing does not prove the full UI V3 journey.

## Release decision record
- [x] GitHub CI test suite added and passed once
- [x] Read-only anonymous database permissions validated
- [ ] CI green on latest preview commit
- [ ] Vercel preview READY at latest commit
- [ ] External HTTP smoke script PASS
- [ ] iPhone Safari visual and interaction sign-off
- [ ] Controlled valid click/vote smoke PASS and cleanup verified
- [ ] Vercel runtime error logs readable under canonical project scope
- [ ] Explicit approval for public merge/promotion

**Disposition:** Not release-ready until each blocking gate is ticked with evidence; main/R1 production stays protected.
