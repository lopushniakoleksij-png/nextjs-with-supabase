import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import PublicShell from "@/components/public-shell";
import SavedDealsList from "@/components/saved-deals-list";
import type { PromoItem } from "@/components/deal-discovery";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your Saved Deals",
  description: "Revisit live promo codes saved on this device.",
};

export const dynamic = "force-dynamic";

export default async function SavedDealsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, title, description, expires_at, created_at, worked_count, failed_count, click_count, stores(name, slug)")
    .eq("approved", true)
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + now)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#ede8ff] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#6542cc]">
          <Bookmark size={15} aria-hidden="true" /> Saved for later
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-[-0.055em] sm:text-5xl">Your saved deals.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          A simple list of your favourite active offers, saved locally in this browser. Bookmarks are not yet synced across devices or accounts.
        </p>
        <SavedDealsList promos={(data || []) as PromoItem[]} />
      </section>
    </PublicShell>
  );
}
