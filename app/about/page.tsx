import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Bookmark, MousePointerClick, ShieldCheck } from "lucide-react";
import PublicShell from "@/components/public-shell";

export const metadata: Metadata = {
  title: "How Promo Code 4 Works | Transparency & Disclosures",
  description: "How our UK promo-code marketplace reviews offers, displays community votes and handles affiliate links.",
};

const steps = [
  {
    title: "Find a currently listed offer",
    body: "We display codes that have been approved for publication and are marked active and unexpired in our database. Approval means a listing passed our publication workflow, not that we independently confirmed a redemption.",
    icon: ShieldCheck,
  },
  {
    title: "Review community feedback",
    body: "Shoppers can report whether a code worked. These votes are community reports, not a guarantee. Offers with few votes can have misleadingly high or low success rates; always check retailer terms.",
    icon: BadgeCheck,
  },
  {
    title: "Try the deal with the retailer",
    body: "Use the code at the retailer's checkout. The link through our site records an outbound click before redirecting. Availability, exclusions and checkout decisions belong to the merchant.",
    icon: MousePointerClick,
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#6746d3]">Trust & transparency</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">Better savings need better information.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          Promo Code 4 helps people discover retailer promotions and understand feedback from other shoppers. We are building the catalogue with real offers, not placeholder discounts.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-[25px] border border-slate-200 bg-white p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#efeaff] text-[#6645c9]"><Icon size={23} aria-hidden="true" /></span>
                <p className="mt-5 text-xs font-black tracking-[0.12em] text-[#6846ca]">STEP {i + 1}</p>
                <h2 className="mt-2 text-lg font-extrabold">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-10 space-y-5 rounded-[25px] border border-[#dbd5f6] bg-[#f1eeff] p-6 sm:p-8">
          <h2 className="text-xl font-black">Things worth knowing</h2>
          <p className="text-sm leading-7 text-slate-700"><strong>Affiliate links:</strong> Some eligible outbound retailer links may earn Promo Code 4 a commission when a purchase qualifies. We do not claim a commission is earned from every click or sale.</p>
          <p className="text-sm leading-7 text-slate-700"><strong>Expiry & terms:</strong> Retailers can change prices, exclusions and coupon availability without notice. Verify terms before purchasing.</p>
          <p className="text-sm leading-7 text-slate-700"><strong>Saved offers:</strong> Bookmarks are kept in this browser only. They are not synced with your account or other devices; clearing browser data may remove them.</p>
          <p className="text-sm leading-7 text-slate-700"><strong>Tracking:</strong> Our deal-redirect and voting systems use browser-generated identifiers to help record clicks and prevent duplicate votes. A more complete public privacy notice is required before broad launch.</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/#offers" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#211b57] px-6 py-3 text-sm font-bold text-white">Explore deals <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/stores" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700">Browse stores</Link>
          <Link href="/saved" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700"><Bookmark size={16} aria-hidden="true" /> Saved deals</Link>
        </div>
      </section>
    </PublicShell>
  );
}
