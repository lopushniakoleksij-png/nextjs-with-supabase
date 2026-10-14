# Promo Code 4 — Merchant discovery and pilot playbook

**Status:** market-validation plan only; not an active sale, contract, or launched Merchant Office. As of 14 October 2026, the production database has zero stores and zero promotions.

## Narrow first test

Test one focused segment: **independent London consumer-service businesses, initially barbers and beauty salons**. This is a working hypothesis, not a proven market choice. These businesses could have repeat visits and promotional needs, but they may already have cheaper or better tools. Do not claim product-market fit.

The merchant problem to test: is it worth paying for an external, verified, easy-to-manage promotional listing and simple engagement reporting?

## Interview target and eligibility

- Conduct 20 genuine discovery interviews with decision-makers at businesses that already advertise offers or wish to fill spare appointment capacity.
- Aim for 5–10 **non-binding** expressions of pilot interest; a polite answer is not a commitment.
- Record sector, decision-maker role, promotion frequency, acquisition channel, current spend/time, desired result, objections, proposed price reactions, and consent for later contact.
- Keep identifiable responses in a private CRM or user-approved restricted workspace; never in this public repo.
- Avoid unsolicited marketing messages that violate UK PECR, privacy laws, or marketplace rules. Ask permission to send follow-up information.

## Ten-minute discovery conversation

1. How do new customers usually find your business?
2. Do you currently run discount codes, first-visit offers or limited-time deals?
3. What is hardest about publishing and measuring those offers?
4. What would make a promotional listing valuable enough to renew?
5. What would make you distrust or stop using a shared offer platform?
6. Which analytics would prove success to you (qualified enquiries, actual redemptions, returning customers)?
7. Would you consider a **non-binding** pilot when a safe working version is ready?
8. Which owner-approved contact method can we use for a later invitation?

Do not promise customer volume, rankings, verified redemption accuracy, conversion uplift, or live product capabilities that are not demonstrated.

## Pilot concept — test, do not sell yet

- Proposed scope: one verified business, a store/service page and a limited set of **admin-reviewed** offers.
- Future access: Merchant Office, only after release approval, for business application and own-store management.
- Metrics: offer publication and expiry correctness, clicks and feedback as **engagement signals**; verified redemptions need independent corroboration.
- Candidate price for market research only: **£199 for three months**. Ask willingness to pay without presenting that as an active order form.
- Clear terms and refund policy are mandatory before collecting money.
- Do not take credit-card details or prepayments until product, service promises and legal status are settled.

## Hard technical blockers before a paid pilot

1. PR #14 must close the inactive-store visibility and click/vote security gap, with verified rollback and explicit release approval.
2. PRs #15–#18 need consolidated migration compatibility review and real Supabase Auth/browser/server-action test evidence, including tenant boundaries and admin approval controls.
3. Demonstrate on mobile as merchant, administrator and visitor. No public offer before business verification and admin moderation.
4. Confirm the real merchant can update or withdraw their own draft/pending offer and cannot access another company's data.
5. Validate customer support, offer takedown, privacy notice, terms and appropriate basic reporting.
6. Production deployment is a separate explicit go/no-go decision; this playbook makes **no** deployment authorization.

## Evidence scorecard

| Indicator | Stage-1 target | What qualifies |
| --- | ---: | --- |
| Completed discovery interviews | 20 | Actual dated interaction, no duplicates |
| Clear repeated problem statements | At least 10 | Merchant describes the problem without prompting |
| Non-binding pilot interest | 5–10 | Business agrees to be re-contacted with scope/terms |
| Willingness-to-pay signal | At least 5 | Reasoned price reaction, not invented order |
| Real onboarded stores | Only after safe release | Admin-verifiable business, not synthetic CI rows |
| First paid contracts | 1–3 test targets | Actual signed terms and received funds |
| Pilot continuation | Measure later | Renewal/conversion based on real cohorts |

Targets here are validation thresholds for decisions, not forecasts.

## Go/no-go for expenditure

- If fewer than 5 of 20 merchants describe the same strong problem, revise the segment or offer before spending.
- If merchants like the idea but none would pay, reconsider pricing and service value instead of asserting demand.
- If the technical security or moderation gate is incomplete, **do not invite merchants into a paying production pilot**.
- When 5–10 non-binding commitments and the safe product gate are both confirmed, prepare pilot contracts, business registration/tax advice, and an honest merchant landing page.
- Keep a dated weekly decision log: evidence, blockers, action, owner and whether it requires user approval.
