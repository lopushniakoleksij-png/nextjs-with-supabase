import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import PublicShell from "@/components/public-shell";
import StoreDirectory, { type PublicStore } from "@/components/store-directory";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Browse UK Stores",
  description: "Browse UK retailers with active store listings and discover available promo codes.",
};

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#6243ca] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> Back to deals
        </Link>
        <div className="mt-8 flex items-center gap-3 text-[#6243ca]">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ebe6ff]"><Store size={25} aria-hidden="true"/></span>
          <span className="text-xs font-black uppercase tracking-[0.14em]">Retailer directory</span>
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.055em] sm:text-5xl">Browse UK stores.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Discover active retailers and check their latest approved offers. Every store listed comes from our real merchant directory.
        </p>
        <StoreDirectory stores={(data || []) as PublicStore[]} />
      </section>
    </PublicShell>
  );
}
