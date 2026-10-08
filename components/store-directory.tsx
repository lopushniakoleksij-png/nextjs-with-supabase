"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Store } from "lucide-react";

export type PublicStore = {
  id: string;
  name: string;
  slug: string;
};

export default function StoreDirectory({ stores }: { stores: PublicStore[] }) {
  const [query, setQuery] = useState("");
  const matching = useMemo(() => {
    const term = query.trim().toLowerCase();
    return stores.filter((store) =>
      [store.name, store.slug].some((value) => value.toLowerCase().includes(term))
    );
  }, [query, stores]);

  return (
    <>
      <div className="relative mt-8">
        <Search size={20} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6d54c7]" />
        <label htmlFor="store-search" className="sr-only">Search for a store</label>
        <input
          id="store-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stores..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none focus-visible:border-[#6944da] focus-visible:ring-2 focus-visible:ring-[#6944da]/20"
        />
      </div>
      <p aria-live="polite" className="mt-6 text-sm font-semibold text-slate-600">
        {matching.length} {matching.length === 1 ? "store" : "stores"} {query.trim() ? "matching your search" : "available"}
      </p>
      {matching.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matching.map((store) => (
            <Link
              key={store.id}
              href={"/store/" + store.slug}
              className="group flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#baadf0] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#6944da]"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f0eaff] text-2xl font-black text-[#6743d5]">
                {store.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-extrabold">{store.name}</span>
                <span className="mt-1 block text-xs text-slate-500">View available offers</span>
              </span>
              <ArrowUpRight size={20} className="shrink-0 text-[#6743d5] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-[28px] border border-dashed border-[#d7d3f0] bg-white px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#eee9ff] text-[#6443d6]">
            <Store size={32} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-black tracking-tight">
            {stores.length === 0 ? "Our store directory is being prepared." : "No matching stores."}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            {stores.length === 0
              ? "Real store listings will appear as merchants are onboarded. We never invent retailers to fill a page."
              : "Try a different store name or clear your search."}
          </p>
          {stores.length > 0 && (
            <button onClick={() => setQuery("")} className="mt-5 rounded-full bg-[#211b57] px-5 py-3 text-sm font-bold text-white">Show all stores</button>
          )}
        </div>
      )}
    </>
  );
}
