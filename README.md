# Promo Code 4

**UK-focused promotional offer discovery — early-stage product, not yet a commercial launch.**

Promo Code 4 is being built to connect customers looking for timely offers with businesses that want to publish and manage their own discounts across shops, branches and services. The direction is a **verified merchant, moderated promotion** platform rather than an unmoderated voucher feed.

**[Production homepage](https://nextjs-with-supabase-neon-ten.vercel.app)** · [Funding readiness](docs/FUNDING_READINESS.md) · [Merchant pilot plan](docs/MERCHANT_PILOT_PLAYBOOK.md)

> **Stage disclosure, 14 October 2026:** A public site and administrator foundation are deployed, but no actual stores, promotions or validated paying merchants have been established in production. Merchant self-service is in draft review, **not live**. Do not interpret this repository or a successful CI badge as evidence of paying customers, business partnerships or investment.

## What is implemented on production

- Public homepage retrieving approved, active, unexpired promotional offers from Supabase.
- Store and promotional offer routes plus outbound click tracking and visitor feedback.
- Supabase authentication and protected administrator interfaces to manage stores and offers.
- Next.js / React / TypeScript, Supabase / PostgreSQL and Vercel deployment.

Some screens are intentionally empty until real businesses and offers are approved.

## Proposed next stage — not yet shipped

- Verified merchant business applications and controlled platform-admin approval.
- A company with multiple stores or service branches and isolated merchant memberships.
- Product/service catalogues, merchant-submitted **pending** offers and admin moderation before publication.
- Basic merchant engagement reporting, subject to privacy and anti-abuse review.

Work under review: [P2 visibility/security hardening](https://github.com/lopushniakoleksij-png/nextjs-with-supabase/pull/14), [P3 Merchant Office foundation](https://github.com/lopushniakoleksij-png/nextjs-with-supabase/pull/15), and [P3 real Auth integration testing](https://github.com/lopushniakoleksij-png/nextjs-with-supabase/pull/18). All require explicit go/no-go review before production deployment.

## Pilot and funding strategy

Current priority is **commercial validation**, not a claim of traction. The first experiment is to interview real local merchants, collect evidence of unmet needs, and invite a small pilot cohort **only when security, merchant authorization and moderation are verified**.

A future pre-seed raise of around **£150,000** has been proposed as a planning scenario, **not** a secured investment or an agreed valuation. Legal incorporation, IP ownership, market evidence and investor eligibility all need confirmation. We are not accepting investment through this repository.

See the [funding evidence checklist](docs/FUNDING_READINESS.md) and [merchant pilot playbook](docs/MERCHANT_PILOT_PLAYBOOK.md) for release dependencies and stage gates.

## Development

This repository uses the Next.js App Router, TypeScript, Supabase and npm.

1. Copy `.env.example` to `.env.local` and enter only your own development Supabase publishable connection details. Never commit keys or credentials.
2. Run `npm ci`.
3. Run `npm run dev`.
4. For the standard checks, run `npm run typecheck`, `npm run lint` and `npm run build`.

**Development instructions do not authorise applying migrations to production.** The P2/P3 draft PRs contain guarded migrations and tests. Do not deploy them, bypass admin approval, or weaken row-level security without the explicit production release decision.

## Public feedback and project use

Technical bug reports and general product feedback can be raised through GitHub issues; avoid posting private customer, account, payment or security information. Commercial pilot and funding enquiries are not handled as public issue submissions.

**Code rights:** a public repository is not automatically open-source licensed. No project-wide `LICENSE` file has been verified as of this review. This README does not grant a licence, invite reuse of proprietary components, or establish GitHub Sponsors eligibility.
