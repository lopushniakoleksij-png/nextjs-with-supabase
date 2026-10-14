"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import DealDiscovery, { type PromoItem } from "@/components/deal-discovery";
import { readSavedIds, SAVED_EVENT, SAVED_KEY } from "@/lib/saved-deals";

export default function SavedDealsList({ promos }: { promos: PromoItem[] }) {
  const [savedIds, setSavedIds] = useState<string[] | null>(null);

  useEffect(() => {
    const refresh = () => setSavedIds(readSavedIds());
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_KEY || event.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAVED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAVED_EVENT, refresh);
    };
  }, []);

  if (savedIds === null) {
    return <p role="status" className="mt-8 text-sm text-slate-500">Loading your saved deals…</p>;
  }

  const saved = promos.filter((promo) => savedIds.includes(promo.id));

  if (saved.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-[28px] border border-dashed border-[#d7d3f0] bg-white px-6 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#eee9ff] text-[#6443d6]"><Bookmark size={32} aria-hidden="true" /></span>
        <h2 className="mt-5 text-xl font-black tracking-tight">No live saved deals yet.</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
          Save an active offer while browsing and it will appear here on this device. Removed or expired offers will no longer be listed.
        </p>
        <Link href="/#offers" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#211b57] px-5 py-3 text-sm font-bold text-white">
          Browse deals <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return <div className="mt-8"><DealDiscovery promos={saved} /></div>;
}
