import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MousePointerClick,
  ShieldCheck,
  Store,
} from "lucide-react";

type PromoRow = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  stores:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

export const dynamic = "force-dynamic";

const projectRepository =
  "https://github.com/lopushniakoleksij-png/nextjs-with-supabase";

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Keep the current production read path intact. P2's disabled-store
  // visibility/RPC hardening remains separately gated in draft PR #14.
  const { data: promoCodes, error } = await supabase
    .from("promo_codes")
    .select("id, code, title, description, expires_at, stores(name, slug)")
    .eq("approved", true)
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + now)
    .order("expires_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  const promos = (promoCodes || []) as PromoRow[];

  return (
    <main className="min-h-screen bg-[#f8faf8] text-[#172c28]">
      <header className="border-b border-[#e4ece8] bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <a
            href="#top"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a7f6d]"
            aria-label="Offqira home"
          >
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-[14px] bg-[#135c50] text-xl font-black text-white shadow-sm"
            >
              o.
            </span>
            <span className="text-[24px] font-extrabold tracking-[-0.06em] text-[#16382f]">
              offqira
            </span>
          </a>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-semibold text-[#455a54] md:flex">
            <a href="#how-it-works" className="transition hover:text-[#146c5b] focus-visible:underline">
              The idea
            </a>
            <a href="#offers" className="transition hover:text-[#146c5b] focus-visible:underline">
              Offers
            </a>
            <a href="#for-businesses" className="transition hover:text-[#146c5b] focus-visible:underline">
              For businesses
            </a>
            <a href="#progress" className="transition hover:text-[#146c5b] focus-visible:underline">
              Our progress
            </a>
          </nav>
          <a
            href="#offers"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#193c34] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b6356] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167f6c]"
          >
            See offers <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </header>

      <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-36 size-[500px] rounded-full bg-[#dcefe6] opacity-80 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 size-[420px] rounded-full bg-[#e4e7fb] opacity-60 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-20 sm:px-8 md:pt-28 lg:grid-cols-[1.04fr_0.96fr] lg:gap-20 lg:px-12 lg:pb-32">
          <div>
            <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-[#cbe2d6] bg-white px-3 py-2 text-xs font-semibold tracking-wide text-[#2c6856] shadow-sm">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#28a17d]" />
              UK-based platform · Early development
            </div>
            <h1 id="hero-heading" className="max-w-[750px] text-[clamp(3rem,6vw,5.85rem)] font-extrabold leading-[1.04] tracking-[-0.075em] text-[#173d33]">
              Better offers.
              <br />
              <span className="text-[#288d72]">Better discovery.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#52645e] sm:text-xl">
              Meet Offqira: a new home for promotional offers from UK businesses. We&apos;re building a more thoughtful way to discover deals, manage promotions and understand what works.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#65736d]">
              The platform is in development. Merchant self-service and public offer listings are being prepared for a controlled pilot.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#offers"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#166e5e] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-16px_#166e5e] transition hover:bg-[#125747] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166e5e]"
              >
                Explore live offers <ArrowRight aria-hidden="true" className="size-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#bfd8cc] bg-white px-6 py-3 text-sm font-bold text-[#23483d] transition hover:bg-[#eff8f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166e5e]"
              >
                What we&apos;re building
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[#526c60]">
              <span className="inline-flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="size-4 text-[#21866d]" /> UK-focused</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-[#21866d]" /> Review-first approach</span>
              <span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 text-[#21866d]" /> Pilot preparation</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[42px] border border-white/70 bg-white/30" />
            <div className="relative overflow-hidden rounded-[32px] border border-[#dbe7de] bg-white shadow-[0_30px_90px_-30px_rgba(12,56,44,0.20)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#eaf0eb] px-6 py-5">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#365a4a]">
                  <span className="size-2 rounded-full bg-[#35aa86]" aria-hidden="true" />
                  Product concept
                </span>
                <span className="rounded-full bg-[#f1f5f1] px-3 py-1 text-[11px] font-semibold text-[#5c7264]">
                  Merchant workflow · Planned
                </span>
              </div>
              <div className="bg-gradient-to-br from-[#f4faf5] via-white to-[#f4f2ff] px-6 py-10 sm:px-9">
                <div className="mb-8">
                  <p className="text-sm font-semibold text-[#2d7c65]">A more useful offer journey</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-[#183a31]">From idea to discovery.</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#63766c]">
                    A preview of the controlled publishing flow we&apos;re developing.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl border border-[#e4eae4] bg-white p-4 shadow-sm">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f8ec] text-[#166c59]"><Store aria-hidden="true" className="size-6" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#213d33]">01 · Create an offer</p>
                      <p className="text-sm text-[#738076]">Merchant submits for review</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7f9589]">Planned</span>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-[#e4eae4] bg-white p-4 shadow-sm">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ecedff] text-[#5459ab]"><BadgeCheck aria-hidden="true" className="size-6" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#213d33]">02 · Review before launch</p>
                      <p className="text-sm text-[#738076]">Platform moderation controls</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7f9589]">Planned</span>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-[#e4eae4] bg-white p-4 shadow-sm">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff1d7] text-[#936b2d]"><MousePointerClick aria-hidden="true" className="size-6" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#213d33]">03 · Help people discover</p>
                      <p className="text-sm text-[#738076]">Browse live, approved offers</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7f9589]">Planned</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#e7eee8] bg-[#f9fcfa] px-6 py-5 text-xs leading-relaxed text-[#647a6c] sm:px-9">
                Concept illustration only. No demo offers, merchants or performance metrics are represented as real.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how-title" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.17em] text-[#29866f]">Made for both sides of the offer</p>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 id="how-title" className="max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.055em] text-[#173d33] sm:text-5xl">
              Good promotions should be simple to find and manage.
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-[#66776f]">
              One platform designed to bring customers, offers and businesses closer together.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-[26px] border border-[#e3ede7] bg-[#f5faf6] p-7">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e1f3e7] text-[#207660]"><MousePointerClick aria-hidden="true" className="size-6" /></span>
              <h3 className="mt-7 text-xl font-extrabold tracking-tight">For shoppers</h3>
              <p className="mt-3 text-sm leading-7 text-[#60756a]">Explore offers in one place, with expiry information and a direct path to the participating business when offers are available.</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#3a8370]">Public browsing foundation exists</p>
            </article>
            <article className="rounded-[26px] border border-[#e3ede7] bg-[#f5faf6] p-7">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e5e8ff] text-[#575bb5]"><Store aria-hidden="true" className="size-6" /></span>
              <h3 className="mt-7 text-xl font-extrabold tracking-tight">For businesses</h3>
              <p className="mt-3 text-sm leading-7 text-[#60756a]">Our planned Merchant Office will help verified businesses organise stores, services and promotion submissions in one workspace.</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#6165b0]">Merchant Office in development</p>
            </article>
            <article className="rounded-[26px] border border-[#e3ede7] bg-[#f5faf6] p-7">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff2db] text-[#ab7b28]"><ShieldCheck aria-hidden="true" className="size-6" /></span>
              <h3 className="mt-7 text-xl font-extrabold tracking-tight">Built around trust</h3>
              <p className="mt-3 text-sm leading-7 text-[#60756a]">Business verification, approval-before-publication and cross-business security checks are central to our release plan.</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#956d32]">Release security checks ongoing</p>
            </article>
          </div>
        </div>
      </section>

      <section id="offers" aria-labelledby="offers-title" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.17em] text-[#29866f]">Offer discovery</p>
              <h2 id="offers-title" className="mt-3 text-4xl font-extrabold tracking-[-0.055em] text-[#173d33] sm:text-5xl">
                Live offers
              </h2>
              <p className="mt-3 max-w-xl text-base text-[#61746a]">Only eligible offers are shown here. Availability will grow after real merchants are approved.</p>
            </div>
            <span className="rounded-full border border-[#d5e5da] bg-white px-4 py-2 text-xs font-bold text-[#4d7260]">
              {promos.length === 0 ? "Preparing for pilot" : "Available offers"}
            </span>
          </div>

          {promos.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-[30px] border border-dashed border-[#bcd6c7] bg-white px-6 py-16 text-center sm:py-20">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-[#edf7f0] text-[#247b64]"><Clock3 aria-hidden="true" className="size-8" /></div>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-[#193f33]">The good offers are being prepared.</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[#64766c]">
                There are no published offers right now. We&apos;re preparing verified merchant onboarding and real promotions before opening the marketplace more widely.
              </p>
              <a href="#progress" className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-[#1c7660] hover:underline focus-visible:underline">
                See what comes next <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {promos.map((promo) => {
                const store = Array.isArray(promo.stores)
                  ? promo.stores[0]
                  : promo.stores;

                return (
                  <article key={promo.id} className="flex h-full flex-col rounded-[25px] border border-[#dce8de] bg-white p-6 shadow-[0_15px_40px_-30px_rgba(13,55,42,0.25)]">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-[#275948]">{store?.name || "Store"}</p>
                      {promo.expires_at && (
                        <span className="shrink-0 rounded-full bg-[#fff6e8] px-2.5 py-1 text-[11px] font-semibold text-[#906a31]">
                          Ends {new Date(promo.expires_at).toLocaleDateString("en-GB")}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-5 text-xl font-extrabold tracking-tight text-[#203c31]">{promo.title || "Promotional offer"}</h3>
                    {promo.description && <p className="mt-3 flex-1 text-sm leading-7 text-[#66776f]">{promo.description}</p>}
                    <div className="mt-6 rounded-xl border border-[#e6ede8] bg-[#f6faf7] px-4 py-3 font-mono text-sm font-semibold break-all text-[#244e3f]">{promo.code}</div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <a href={"/go/" + promo.id} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#166e5e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#125747] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166e5e]">
                        Use deal <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                      {store?.slug && <a href={"/store/" + store.slug} className="text-xs font-bold text-[#2c6f5e] underline underline-offset-4">More from this store</a>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="for-businesses" aria-labelledby="business-title" className="bg-[#173c33] py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.17em] text-[#8cdabb]">For businesses</p>
            <h2 id="business-title" className="mt-4 max-w-xl text-4xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl">
              Your business. Your offers. One place.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#ccdfd4]">
              We&apos;re designing a Merchant Office for verified businesses to manage promotions across stores, branches, products and services—with final publication controlled by the platform.
            </p>
            <p className="mt-5 text-sm font-bold text-[#adf0d1]">
              Merchant applications are not open yet.
            </p>
          </div>
          <div className="rounded-[28px] border border-[#4a7465] bg-[#225044] p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b4e9cf]">Planned merchant capabilities</p>
            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-3"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#9be0bd]" /><div><p className="font-bold">One business, multiple locations</p><p className="mt-1 text-sm leading-6 text-[#c3dacf]">Organise shops, branches and services with role-based permissions.</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#9be0bd]" /><div><p className="font-bold">Control the promotion lifecycle</p><p className="mt-1 text-sm leading-6 text-[#c3dacf]">Submit and manage offers while administrators review publication.</p></div></div>
              <div className="flex items-start gap-3"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#9be0bd]" /><div><p className="font-bold">Understand engagement</p><p className="mt-1 text-sm leading-6 text-[#c3dacf]">Work toward useful reporting without promising verified sales or conversions.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="progress" aria-labelledby="progress-title" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.17em] text-[#29866f]">Building in the open</p>
          <h2 id="progress-title" className="mt-3 max-w-2xl text-4xl font-extrabold tracking-[-0.055em] text-[#173d33] sm:text-5xl">
            Real progress. Clear next steps.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#66766e]">
            Offqira is at the pre-revenue stage. We&apos;re validating the product and prioritising secure merchant access before inviting real businesses into a pilot.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-[#deebe1] bg-[#f7faf7] p-6">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2b866d]"><CheckCircle2 aria-hidden="true" className="size-4" /> Available now</span>
              <h3 className="mt-5 text-xl font-extrabold">Core platform</h3>
              <p className="mt-3 text-sm leading-7 text-[#63776d]">Public offer browsing foundation, authentication, administrative moderation screens and a deployed website.</p>
            </div>
            <div className="rounded-3xl border border-[#deebe1] bg-[#f7faf7] p-6">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6267b5]"><Clock3 aria-hidden="true" className="size-4" /> Under review</span>
              <h3 className="mt-5 text-xl font-extrabold">Merchant Office</h3>
              <p className="mt-3 text-sm leading-7 text-[#63776d]">Business verification, multi-store management, security checks and controlled offer submissions.</p>
            </div>
            <div className="rounded-3xl border border-[#deebe1] bg-[#f7faf7] p-6">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#966f31]"><ArrowRight aria-hidden="true" className="size-4" /> Next milestone</span>
              <h3 className="mt-5 text-xl font-extrabold">Real merchant pilot</h3>
              <p className="mt-3 text-sm leading-7 text-[#63776d]">Validate merchant demand and publish real offers only after the technical and commercial release gates pass.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="investor-title" className="bg-[#eff6ef] py-14 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#2e8067]">For potential partners and investors</p>
            <h2 id="investor-title" className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-[#173d33] sm:text-4xl">An early-stage project with a product foundation.</h2>
            <p className="mt-3 text-sm leading-7 text-[#5d7166]">
              UK-based, founder-led and pre-revenue. The venture is not yet incorporated, and merchant pilots have not begun. Product development is documented publicly; future funding remains exploratory.
            </p>
          </div>
          <a
            href={projectRepository}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#b8d9c5] bg-white px-5 py-3 text-sm font-bold text-[#255a48] transition hover:bg-[#e3f5e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166e5e]"
          >
            Review project development <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-[#e0e9e1] bg-white py-9">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 text-sm text-[#6b7a70] sm:px-8 md:flex-row md:items-center lg:px-12">
          <div>
            <p className="text-lg font-extrabold tracking-[-0.04em] text-[#183e33]">offqira<span className="text-[#31a37e]">.</span></p>
            <p className="mt-1 text-xs">A UK-based promotional marketplace project in development.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a href="#top" className="hover:text-[#166e5e] hover:underline">Back to top</a>
            <a href="#progress" className="hover:text-[#166e5e] hover:underline">Project status</a>
            <a href={projectRepository} target="_blank" rel="noopener noreferrer" className="hover:text-[#166e5e] hover:underline">GitHub <ArrowUpRight aria-hidden="true" className="inline size-3" /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
