"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CircleX,
  Search,
  SlidersHorizontal,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import UseCodeButton from "@/components/UseCodeButton";
import SaveDealButton from "@/components/save-deal-button";

import { findPromos, promoStore, voteCounts, type SortOrder, type PromoItem } from "@/lib/promo-discovery";
export type { PromoItem } from "@/lib/promo-discovery";

export default function DealDiscovery({ promos }: { promos: PromoItem[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const term = search.trim();

  const results = useMemo(() => findPromos(promos, term, sort), [promos, term, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_12px_40px_rgba(16,24,43,0.04)] sm:flex-row sm:items-center sm:p-4">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" size={21} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e56c4]" />
          <label className="sr-only" htmlFor="deal-search">Search deals, stores or codes</label>
          <input
            id="deal-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Search brands, deals or codes..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f7f7fc] py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7656da] focus:ring-2 focus:ring-[#7656da]/20"
          />
        </div>
        <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:min-w-[208px]">
          <SlidersHorizontal size={18} className="shrink-0 text-[#7059bb]" aria-hidden="true" />
          <label htmlFor="sort-deals" className="sr-only">Sort offers</label>
          <select
            id="sort-deals"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOrder)}
            className="w-full appearance-none bg-transparent pr-5 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="newest">Newest offers</option>
            <option value="helpful">Best community feedback</option>
            <option value="expiring">Ending soonest</option>
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌄</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm font-semibold text-slate-600">
          {results.length} {results.length === 1 ? "offer" : "offers"} {term ? "matching your search" : "available"}
        </p>
        {term && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6944d5] hover:underline"
          >
            <CircleX size={16} aria-hidden="true" /> Clear search
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-[28px] border border-dashed border-[#d7d3f0] bg-white px-6 py-14 text-center sm:py-20">
          <div className="relative grid h-20 w-20 place-items-center rounded-[26px] bg-[#ede9ff] text-[#6443d6]">
            <TicketPercent size={38} strokeWidth={1.75} aria-hidden="true" />
            <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-[#c9fa7a] text-[#1c2250]"><Sparkles size={16} aria-hidden="true" /></span>
          </div>
          {promos.length === 0 ? (
            <>
              <span className="mt-7 rounded-full bg-[#f1efff] px-3 py-1.5 text-xs font-extrabold text-[#6244ca]">COLLECTION IN PROGRESS</span>
              <h3 className="mt-4 max-w-lg text-2xl font-black tracking-[-0.04em] sm:text-3xl">Great offers are worth waiting for.</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                There are no approved promo codes live yet. We&apos;ll show real offers here as soon as they are added.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/about" className="inline-flex items-center gap-2 rounded-full bg-[#211b57] px-5 py-3 text-sm font-bold text-white hover:bg-[#42338d]">
                  See how it works <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="/auth/sign-up" className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Create account</Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-7 text-2xl font-black tracking-tight">No matching deals found.</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">Try a different brand or search term to see available offers.</p>
              <button type="button" onClick={() => setSearch("")} className="mt-6 rounded-full bg-[#211b57] px-5 py-3 text-sm font-bold text-white hover:bg-[#42338d]">Show all offers</button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((promo) => {
            const store = promoStore(promo);
            const votes = voteCounts(promo).total;
            const rate = votes > 0 ? Math.round(((promo.worked_count || 0) / votes) * 100) : null;
            return (
              <article key={promo.id} className="flex min-w-0 flex-col rounded-[25px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between gap-3">
                  {store?.slug ? (
                    <Link href={"/store/" + store.slug} className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eeeaff] text-lg font-black text-[#6244ca]">{(store.name || "S").charAt(0).toUpperCase()}</span>
                      <span className="truncate text-sm font-extrabold text-slate-800">{store.name}</span>
                    </Link>
                  ) : (
                    <span className="font-extrabold text-slate-800">UK deal</span>
                  )}
                  <span className="shrink-0 rounded-full bg-[#eefbea] px-3 py-1.5 text-[11px] font-extrabold text-[#287a43]">Approved</span>
                </div>

                <div className="mt-6 flex-1">
                  <h3 className="text-xl font-black tracking-[-0.025em] text-slate-900">{promo.title || "Promo code"}</h3>
                  {promo.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{promo.description}</p>}
                  <div className="mt-5 rounded-xl border border-dashed border-[#b5a7e6] bg-[#f6f3ff] px-4 py-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6551b1]">Promo code</p>
                    <p className="mt-1 break-all font-mono text-lg font-extrabold text-[#271960]">{promo.code}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  {rate !== null ? (
                    <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#6551b1]" aria-hidden="true" /> {rate}% worked · {votes} {votes === 1 ? "vote" : "votes"}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#6551b1]" aria-hidden="true" /> Awaiting community votes</span>
                  )}
                  {promo.expires_at && (
                    <span className="inline-flex items-center gap-1.5"><CalendarClock size={15} aria-hidden="true" /> Ends {new Date(promo.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}</span>
                  )}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex justify-end"><SaveDealButton promoId={promo.id} /></div>
                  <UseCodeButton code={promo.code} promoId={promo.id} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
