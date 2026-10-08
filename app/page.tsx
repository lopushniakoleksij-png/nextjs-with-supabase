import Link from "next/link";
import {
  ArrowRight, BadgeCheck, CheckCircle2, ChevronRight,
  ClipboardCheck, MousePointerClick, Search, ShieldCheck, TicketPercent,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DealDiscovery, { type PromoItem } from "@/components/deal-discovery";
import PublicShell from "@/components/public-shell";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, title, description, expires_at, created_at, worked_count, failed_count, click_count, stores!inner(name, slug)")
    .eq("approved", true)
    .eq("is_active", true)
    .eq("stores.is_active", true)
    .or("expires_at.is.null,expires_at.gt." + now)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const promos = (data || []) as PromoItem[];

  return (
    <PublicShell>
        <section className="relative overflow-hidden bg-[#11143a] text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-48 h-[520px] w-[520px] rounded-full bg-[#6b46d9]/35 blur-[80px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-56 -left-32 h-[390px] w-[390px] rounded-full bg-[#4837a8]/30 blur-[70px]" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-7 px-5 pb-9 pt-9 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-24">
            <div className="max-w-[610px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#aeb1ee]/25 bg-white/10 px-3.5 py-2 text-xs font-bold tracking-wide text-[#d7d5ff]">
                <span className="h-2 w-2 rounded-full bg-[#c9fa7a]" />
                MADE FOR SMARTER UK SHOPPING
              </span>
              <h1 className="mt-5 text-[clamp(2.25rem,6vw,5rem)] font-black leading-[1.04] tracking-[-0.06em]">
                Good deals.
                <span className="block text-[#c9fa7a]">Less guesswork.</span>
              </h1>
              <p className="mt-4 max-w-[500px] text-base leading-7 text-[#c4c6dc] sm:text-lg sm:leading-8">
                {promos.length === 0
                  ? "We’re preparing our first approved UK retailer offers. See how the platform works while our catalogue grows."
                  : "Find promo codes from UK stores, review community feedback, and shop with more confidence."}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={promos.length === 0 ? "#how-it-works" : "#offers"} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#c9fa7a] px-6 py-3 text-sm font-extrabold text-[#171c31] transition hover:bg-[#e1ffb4]">
                  {promos.length === 0 ? "How it works" : "Explore deals"} <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href={promos.length === 0 ? "#offers" : "#how-it-works"} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  {promos.length === 0 ? "Offer status" : "How it works"} <ChevronRight size={18} aria-hidden="true" />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-[#c3c5df] sm:text-sm">
                <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-[#c9fa7a]" aria-hidden="true" /> Approved offers</span>
                <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-[#c9fa7a]" aria-hidden="true" /> Community feedback</span>
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-[430px] lg:mx-0 lg:block" aria-label="How Promo Code 4 works">
              <div className="absolute -right-3 -top-5 rotate-6 rounded-2xl bg-[#c9fa7a] px-5 py-3 text-base font-black text-[#171c31] shadow-lg sm:right-0">
                SAVE SMARTER ✳
              </div>
              <div className="rounded-[30px] border border-white/15 bg-white/10 p-5 shadow-[0_26px_100px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-7">
                <div className="flex items-center justify-between border-b border-white/15 pb-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c9fa7a]/15 text-[#c9fa7a]"><TicketPercent size={24} aria-hidden="true"/></span>
                    <div>
                      <p className="text-sm font-bold">Your savings toolkit</p>
                      <p className="text-xs text-[#c3c5db]">Simple, useful, transparent</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs font-bold text-[#c9fa7a]">UK</span>
                </div>
                <div className="space-y-3 py-5">
                  <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#b7a2ff]/20 text-[#d7caff]"><Search size={21} aria-hidden="true" /></span>
                    <div><p className="text-sm font-bold">Find a deal</p><p className="mt-0.5 text-xs text-[#c4c6db]">Browse active, approved codes</p></div>
                    <CheckCircle2 size={17} className="ml-auto shrink-0 text-[#c9fa7a]" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#b7a2ff]/20 text-[#d7caff]"><ClipboardCheck size={21} aria-hidden="true" /></span>
                    <div><p className="text-sm font-bold">Check feedback</p><p className="mt-0.5 text-xs text-[#c4c6db]">See how other shoppers voted</p></div>
                    <CheckCircle2 size={17} className="ml-auto shrink-0 text-[#c9fa7a]" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#b7a2ff]/20 text-[#d7caff]"><MousePointerClick size={21} aria-hidden="true" /></span>
                    <div><p className="text-sm font-bold">Use your code</p><p className="mt-0.5 text-xs text-[#c4c6db]">Open the store to redeem</p></div>
                    <CheckCircle2 size={17} className="ml-auto shrink-0 text-[#c9fa7a]" aria-hidden="true" />
                  </div>
                </div>
                <p className="border-t border-white/15 pt-4 text-center text-xs text-[#c4c6db]">No invented discounts. Just the offers actually available.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="offers" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-20">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6844db]">Explore offers</span>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">{promos.length === 0 ? "Our first offers are on the way." : "Discover your next deal."}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">{promos.length === 0 ? "We are onboarding retailers. The first approved offers will appear here when they are available." : "Search approved, active promo codes. Your results update as new offers are added."}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-[#8254e4]" />
              {promos.length} {promos.length === 1 ? "live offer" : "live offers"}
            </span>
          </div>
          <DealDiscovery promos={promos} />
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6844db]">Simple by design</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">A better way to find a code.</h2>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-[#fafaff] p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eee8ff] text-[#6844db]"><Search size={25} aria-hidden="true"/></span>
                <p className="mt-5 text-xs font-black tracking-wider text-[#6844db]">01 / DISCOVER</p>
                <h3 className="mt-2 text-lg font-extrabold">Search real offers</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Search by store, deal title or code. Only active, approved listings are shown.</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-[#fafaff] p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eee8ff] text-[#6844db]"><BadgeCheck size={25} aria-hidden="true"/></span>
                <p className="mt-5 text-xs font-black tracking-wider text-[#6844db]">02 / COMPARE</p>
                <h3 className="mt-2 text-lg font-extrabold">See the feedback</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">When shoppers vote, you can see how often a code has worked for the community.</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-[#fafaff] p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eee8ff] text-[#6844db]"><MousePointerClick size={25} aria-hidden="true"/></span>
                <p className="mt-5 text-xs font-black tracking-wider text-[#6844db]">03 / REDEEM</p>
                <h3 className="mt-2 text-lg font-extrabold">Shop with the code</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Copy the code and follow the tracked deal link to the retailer to try it.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[30px] bg-[#e9e7ff] px-7 py-9 sm:flex-row sm:items-center sm:p-11">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#6244ca]">Join the community</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Better deals start here.</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">Create an account and be ready as the collection of UK offers grows.</p>
            </div>
            <Link href="/auth/sign-up" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#211b57] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#42338d]">
              Create your account <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
    </PublicShell>
  );
}
