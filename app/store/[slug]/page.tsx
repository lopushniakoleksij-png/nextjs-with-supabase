import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, Store } from "lucide-react";
import PublicShell from "@/components/public-shell";
import VoteButtons from "@/components/VoteButtons";
import UseCodeButton from "@/components/UseCodeButton";
import SaveDealButton from "@/components/save-deal-button";
import { createClient } from "@/lib/supabase/server";

type StoreRow = {
  id: string;
  slug: string;
  name: string;
};

type PromoRow = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  click_count: number | null;
  worked_count: number | null;
  failed_count: number | null;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  return {
    title: `${name} Promo Codes & Deals`,
    description: `Browse active, approved promo code listings for ${name} and review community feedback.`,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, slug, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<StoreRow>();

  if (storeError) throw new Error(storeError.message);
  if (!store) notFound();

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, title, description, expires_at, click_count, worked_count, failed_count")
    .eq("store_id", store.id)
    .eq("approved", true)
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt." + now)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const promos = (data || []) as PromoRow[];

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <Link href="/stores" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#6243ca] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" /> All stores
        </Link>
        <div className="mt-8 flex flex-col gap-4 rounded-[28px] bg-[#171443] p-7 text-white sm:flex-row sm:items-center sm:gap-6 sm:p-10">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#c9fa7a] text-3xl font-black text-[#201c4a]">
            {store.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#c9fa7a]"><Store size={15} aria-hidden="true" /> Store offers</span>
            <h1 className="mt-2 break-words text-3xl font-black tracking-[-0.045em] sm:text-4xl">{store.name} discount codes</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#cbc9e5]">Browse active listings and check community feedback before trying a code at this retailer.</p>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-tight">Available offers</h2>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            {promos.length} {promos.length === 1 ? "active offer" : "active offers"}
          </span>
        </div>

        {promos.length === 0 ? (
          <div className="mt-6 rounded-[26px] border border-dashed border-[#d7d3f0] bg-white px-6 py-14 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#efeaff] text-[#6542d0]"><Store size={28} aria-hidden="true" /></span>
            <h3 className="mt-5 text-xl font-black">No current offers from {store.name}.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">We only show approved, active listings. Check back later for new codes.</p>
            <Link href="/stores" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#211b57] px-5 py-3 text-sm font-bold text-white">
              Browse other stores
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {promos.map((promo) => {
              const worked = promo.worked_count || 0;
              const failed = promo.failed_count || 0;
              const votes = worked + failed;
              const rate = votes ? Math.round((worked / votes) * 100) : null;

              return (
                <article key={promo.id} className="flex flex-col rounded-[25px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-[#eefbea] px-3 py-1.5 text-xs font-bold text-[#267a42]">Approved listing</span>
                    <SaveDealButton promoId={promo.id} />
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-tight">{promo.title || "Promo code"}</h3>
                  {promo.description && <p className="mt-2 text-sm leading-6 text-slate-600">{promo.description}</p>}
                  <div className="mt-5 rounded-xl border border-dashed border-[#ad9ce9] bg-[#f6f3ff] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#6746b9]">Code</p>
                    <p className="mt-1 break-all font-mono text-lg font-black text-[#291e59]">{promo.code}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><BadgeCheck size={16} className="text-[#6844ca]" aria-hidden="true" />
                      {rate === null ? "No community votes yet" : `${rate}% worked · ${votes} ${votes === 1 ? "vote" : "votes"}`}
                    </span>
                    {promo.expires_at && (
                      <span className="inline-flex items-center gap-1.5"><CalendarDays size={16} aria-hidden="true" />
                        Ends {new Date(promo.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-5"><UseCodeButton code={promo.code} promoId={promo.id} /></div>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-600">Did this code work for you?</p>
                    <VoteButtons promoId={promo.id} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="mt-8 text-xs leading-6 text-slate-500">
          Approval means a code is listed for publication, not that redemption is guaranteed. Please check retailer terms.
          <Link href="/about" className="ml-1 font-bold text-[#6341c9] underline">How our feedback works</Link>
        </p>
      </section>
    </PublicShell>
  );
}
