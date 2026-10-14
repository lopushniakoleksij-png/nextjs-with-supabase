# Promo Code 4 — Funding-readiness and evidence gates

**Working plan, 14 October 2026.** This document describes preparation, not an offer of securities, an assurance of SEIS eligibility, or a claim that funding is secured.

## Verified operating baseline (14 October 2026)

- Public production deployment on Vercel at https://nextjs-with-supabase-neon-ten.vercel.app; deployment READY on `main` at `77788cfc65075aa80a0ccb6cdb63c7dd5b5a6521`.
- Stack: Next.js, Supabase Auth/PostgreSQL, and deployment workflows.
- Read-only production data check: **10 profiles**, **0 stores**, **0 promo codes**, **0 promo clicks**, **0 promo votes**.
- Do **not** call profiles merchants, paying users, customers, adoption, or traction without evidence.
- Merchant Office implementation is under draft review in PRs #15–#18, **not deployed**.
- The disabled-store offer visibility hardening is under draft review in PR #14, **not deployed**.
- No verified paying customer, pilot revenue, signed merchant agreement, company incorporation, SEIS clearance, or committed investor.

## Funding thesis — hypothesis, not proof

Promo Code 4 aims to help verified UK businesses maintain promotional offers across one or more stores or service locations, with moderated publication and consumer success signals. The first market question is whether merchants will **pay** for verified, low-friction distribution and measurement instead of relying on their own existing marketing tools. The second is whether consumers discover and use offers through the platform often enough to justify merchant renewals.

The initial commercial model and pricing are **unvalidated hypotheses**. Do not claim that verified code success rates, savings, monthly recurring revenue, business partnerships, or user demand have been established.

## Funding channels ordered by fit

1. **Discovery and non-binding pilot commitments (first):** seek interviews with 20 UK merchants and 5–10 documented expressions of interest. No fee collection before a safe, deliverable pilot and clear refund/service terms.
2. **Customer-financed pilot (only after readiness):** test merchant-paid pilot pricing and acquisition economics; `£199 for three months` is merely an interview/testing hypothesis, not a published price or confirmed offer.
3. **Accelerator applications:** check programme requirements and deadlines, including Techstars London 2027 (listed application deadline 18 November 2026); submit only verified factual claims and a credible founder availability plan.
4. **Small reward crowdfunding:** first verify enough supporters and the costs of rewards. Contributions do not prove recurring software revenue.
5. **Pre-seed equity/SEIS:** a **provisional** £150,000/12-month plan, not a valuation or investment commitment. Prepare only after incorporation, cap-table/IP/title diligence, UK tax advice, merchant evidence, and a realistic operating budget.
6. **UK Start Up Loan:** optional personal debt; subject to eligibility, credit and affordability checks. Not the default while repayment is unproven.
7. **GitHub Sponsors:** **not a current primary route**. It supports open-source contributions; a public repo is not automatically open source, and no `LICENSE` or approved sponsor profile has been verified. Do not enable a fake sponsor link or publish a licence without a rights review.

## Readiness gates (do not skip)

| Gate | Required evidence | Decision |
| --- | --- | --- |
| S0: protect existing production | P2 PR #14 integration evidence, reviewed rollback and explicit release authority; preserve all current admin/RLS guards | No commercial onboarding yet |
| S1: secure merchant workflow | P3 migration ordering, local real Supabase Auth tests, cross-tenant denial, admin moderation, mobile acceptance, reviewed deployment plan | No deployment before approvals |
| C0: identify demand | 20 *genuine* interviews; record category, existing promo channels, pain, willingness to pay, objections, consent to follow up | Do not substitute fabricated test entries |
| C1: pilot intent | 5–10 merchant expressions of interest with agreed prospective deliverables and measured conversion | Clarify non-binding versus paid |
| C2: measured pilot | Real merchants, real offers, approved consented click/usage analytics, retention and unit economics | Only claim metrics after measurement |
| L0: legal/IP readiness | UK legal form/registration, beneficial ownership, source-code/IP rights, brand/domain title, data protection and contract reviews | Counsel/accountant review |
| F0: external funding | Dated demo, verified metrics, realistic budget, 12-month plan, legal/SEIS assessment, signed-off factual pitch | Then approach investors |

## Working 30-day sequence

- **Week 1:** secure the release review checklist; audit rights and marketing claims; interview the first five merchants without asking for money.
- **Week 2:** finish integration and go/no-go for the production security gate; increase interviews to ten; classify objections.
- **Week 3:** progress the Merchant Office release only if CI, real auth, RLS, and admin moderation evidence pass; seek 5 non-binding pilot commitments.
- **Week 4:** decide whether to offer an actual pilot, prepare an accurate demo, choose incorporation timing, and submit only qualifying accelerator/investor applications.

## Evidence and communications rules

- Label all targets, forecasts, valuations, revenues, investor amounts and merchant counts as proposed until independently verified.
- Maintain an evidence ledger for pilot interviews, consent, demo readiness, PR checks, release and paid contracts.
- Do not expose user data, customer names, secrets, private financials, grant applications, identity documents or credentials in this public repository.
- Do not use unrelated business mailboxes or imply a UK limited company already exists.
- Do not silently merge draft PRs, run production SQL, change admin accounts, or purchase Supabase/Vercel upgrades as part of fundraising preparation.

## Review links

- [P2 security gate](https://github.com/lopushniakoleksij-png/nextjs-with-supabase/pull/14)
- [P3 Merchant Office foundation](https://github.com/lopushniakoleksij-png/nextjs-with-supabase/pull/15)
- [P3 Merchant Office](https://github.com/lopushniakoleksij-png/nextjs-with-supabase/pull/17)
- [P3 real-auth test proposal](https://github.com/lopushniakoleksij-png/nextjs-with-supabase/pull/18)
- [GitHub Sponsors requirements](https://docs.github.com/en/sponsors/receiving-sponsorships-through-github-sponsors/setting-up-github-sponsors-for-your-personal-account)
- [UK Start Up Loans](https://www.gov.uk/apply-start-up-loan)
- [Techstars London](https://www.techstars.com/accelerators/london)
