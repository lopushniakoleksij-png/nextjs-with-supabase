import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import {
  createMerchantStore,
  createMerchantItem,
  submitMerchantPromo,
  withdrawMerchantPromo,
} from "@/app/actions/merchant-office";

export const dynamic = "force-dynamic";

type Org = { id: string; name: string; status: string; };
type Membership = { member_role: string; status: string; };
type Store = { id: string; name: string; slug: string; is_active: boolean; };
type Item = { id: string; store_id: string; name: string; item_type: string; is_active: boolean; };
type Promo = {
  id: string; store_id: string; code: string; title: string | null;
  approved: boolean; is_active: boolean; expires_at: string | null;
  click_count: number;
};

const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const buttonClass = "min-h-11 rounded-lg bg-slate-900 px-5 py-2 font-semibold text-white";
const sectionClass = "rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm";

export default async function MerchantBusinessOffice({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orgId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(orgId)) notFound();

  const user = await requireUser();
  const supabase = await createClient();
  const [memberResult, orgResult] = await Promise.all([
    supabase.from("merchant_memberships")
      .select("member_role, status")
      .eq("organization_id", orgId).eq("user_id", user.id).maybeSingle(),
    supabase.from("merchant_organizations")
      .select("id, name, status").eq("id", orgId).maybeSingle(),
  ]);
  const membership = memberResult.data as Membership | null;
  const organization = orgResult.data as Org | null;
  if (memberResult.error || orgResult.error
      || !membership || membership.status !== "active" || !organization) {
    notFound();
  }

  const verified = organization.status === "verified";
  const canManageStores = verified && ["owner", "manager"].includes(membership.member_role);

  let stores: Store[] = [];
  let items: Item[] = [];
  let promos: Promo[] = [];

  if (verified) {
    const [storesResult, itemsResult] = await Promise.all([
      supabase.from("stores")
        .select("id, name, slug, is_active")
        .eq("merchant_organization_id", orgId).order("name"),
      supabase.from("merchant_items")
        .select("id, store_id, name, item_type, is_active")
        .eq("organization_id", orgId).order("name"),
    ]);
    if (storesResult.error || itemsResult.error) {
      throw new Error("Could not load your business shops or catalogue");
    }
    stores = (storesResult.data || []) as Store[];
    items = (itemsResult.data || []) as Item[];
    if (stores.length) {
      const result = await supabase.from("promo_codes")
        .select("id, store_id, code, title, approved, is_active, expires_at, click_count")
        .in("store_id", stores.map((s) => s.id))
        .order("created_at", { ascending: false });
      if (result.error) throw new Error("Could not load your submitted promotions");
      promos = (result.data || []) as Promo[];
    }
  }

  const activeStores = stores.filter((s) => s.is_active);

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-4 py-8 text-slate-900 sm:px-6">
      <header>
        <Link href="/merchant" className="text-sm font-medium text-indigo-700 underline">
          All my businesses
        </Link>
        <h1 className="mt-3 break-words text-3xl font-bold">{organization.name}</h1>
        <p className="mt-2 text-slate-600">
          Merchant Office · {membership.member_role} · {organization.status}
        </p>
      </header>

      {!verified ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold">Business access paused</h2>
          <p className="mt-2 text-sm">
            This business is not verified or has been suspended. Store, item and promo
            management are unavailable. Contact Promo Code 4 support for review.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Business overview">
            {[
              { label: "Shops", count: stores.length },
              { label: "Items", count: items.length },
              { label: "Promos", count: promos.length },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl bg-slate-100 p-3 sm:p-5">
                <p className="text-xs text-slate-600 sm:text-sm">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.count}</p>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">Your shops and branches</h2>
            {stores.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                No shops yet. An owner or manager can add the first branch below.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {stores.map((store) => (
                  <article key={store.id} className={sectionClass}>
                    <h3 className="font-semibold">{store.name}</h3>
                    <p className="mt-1 break-all text-sm text-slate-500">/{store.slug}</p>
                    <p className="mt-2 text-sm">
                      {store.is_active ? "Active" : "Disabled by administrator"}
                    </p>
                    {store.is_active && (
                      <Link href={`/store/${store.slug}`}
                        className="mt-3 inline-block text-sm font-medium text-indigo-700 underline">
                        View public shop
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}
            {canManageStores && (
              <form action={createMerchantStore} className={sectionClass + " max-w-2xl space-y-3"}>
                <h3 className="text-lg font-semibold">Add a shop or branch</h3>
                <input type="hidden" name="organization_id" value={orgId} />
                <div><label className={labelClass} htmlFor="branch-name">Shop/branch name</label>
                  <input id="branch-name" name="name" required minLength={2} maxLength={200}
                    placeholder="London showroom" className={inputClass}/></div>
                <div><label className={labelClass} htmlFor="branch-slug">Unique URL slug</label>
                  <input id="branch-slug" name="slug" required maxLength={100}
                    placeholder="london-showroom" pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    className={inputClass}/></div>
                <div><label className={labelClass} htmlFor="branch-website">Website (optional)</label>
                  <input id="branch-website" name="website_url" type="url"
                    placeholder="https://yourshop.co.uk" className={inputClass}/></div>
                <button className={buttonClass} type="submit">Add branch</button>
              </form>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">Products and services</h2>
            {items.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <article key={item.id} className={sectionClass}>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.item_type === "service" ? "Service" : "Product"} ·{" "}
                      {stores.find(s => s.id === item.store_id)?.name || "Shop"}
                    </p>
                  </article>
                ))}
              </div>
            )}
            {activeStores.length > 0 && (
              <form action={createMerchantItem} className={sectionClass + " max-w-2xl space-y-3"}>
                <h3 className="text-lg font-semibold">Add a product or service</h3>
                <input type="hidden" name="organization_id" value={orgId} />
                <div><label htmlFor="item-store" className={labelClass}>Shop/branch</label>
                  <select id="item-store" name="store_id" required className={inputClass}>
                    {activeStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div><label htmlFor="item-type" className={labelClass}>Type</label>
                  <select id="item-type" name="item_type" required className={inputClass}>
                    <option value="product">Product</option><option value="service">Service</option>
                  </select></div>
                <div><label htmlFor="item-name" className={labelClass}>Name</label>
                  <input id="item-name" name="name" required minLength={2} maxLength={200}
                    className={inputClass} placeholder="Product or service name"/></div>
                <div><label htmlFor="item-description" className={labelClass}>Description</label>
                  <textarea id="item-description" name="description" rows={2}
                    maxLength={3000} className={inputClass}/></div>
                <div><label htmlFor="item-destination" className={labelClass}>Product/service URL (optional)</label>
                  <input id="item-destination" name="destination_url" type="url"
                    className={inputClass} placeholder="https://yourshop.co.uk/product"/></div>
                <button type="submit" className={buttonClass}>Add item</button>
              </form>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">Promo codes and offers</h2>
            <p className="text-sm text-slate-600">
              New promotions remain pending until our platform administrator approves them.
              You can never publish your own offer directly.
            </p>
            {promos.length === 0 ? <p className="text-sm text-slate-500">No offers submitted yet.</p> : (
              <div className="space-y-3">
                {promos.map(promo => {
                  const status = !promo.is_active ? "Withdrawn or disabled"
                    : promo.approved ? "Approved" : "Pending approval";
                  return (
                    <article key={promo.id}
                      className={sectionClass + " flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                      <div className="min-w-0">
                        <h3 className="break-all font-semibold">{promo.code}</h3>
                        <p className="text-sm text-slate-600">
                          {stores.find(s => s.id === promo.store_id)?.name || "Shop"} · {status}
                        </p>
                        {promo.title && <p className="text-sm">{promo.title}</p>}
                        <p className="text-xs text-slate-500">Clicks: {promo.click_count}</p>
                      </div>
                      {canManageStores && promo.is_active && (
                        <form action={withdrawMerchantPromo}>
                          <input type="hidden" name="organization_id" value={orgId}/>
                          <input type="hidden" name="promo_id" value={promo.id}/>
                          <button type="submit" className="min-h-11 rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-800">
                            Withdraw offer
                          </button>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            {activeStores.length > 0 && (
              <form action={submitMerchantPromo} className={sectionClass + " max-w-2xl space-y-3"}>
                <h3 className="text-lg font-semibold">Submit a new promotion</h3>
                <input type="hidden" name="organization_id" value={orgId}/>
                <div><label className={labelClass} htmlFor="promo-store">Shop/branch</label>
                  <select id="promo-store" name="store_id" required className={inputClass}>
                    {activeStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div><label className={labelClass} htmlFor="promo-item">Product/service (optional)</label>
                  <select id="promo-item" name="item_id" className={inputClass} defaultValue="">
                    <option value="">Shop-wide discount</option>
                    {items.filter(i=>i.is_active && activeStores.some(s=>s.id===i.store_id)).map(item =>
                      <option key={item.id} value={item.id}>
                        {stores.find(s => s.id === item.store_id)?.name} — {item.name}
                      </option>)}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Select an item belonging to the chosen shop.
                  </p>
                </div>
                <div><label htmlFor="promo-code" className={labelClass}>Promo code</label>
                  <input id="promo-code" name="code" required maxLength={80}
                    placeholder="SAVE20" className={inputClass}/></div>
                <div><label htmlFor="promo-title" className={labelClass}>Offer title (optional)</label>
                  <input id="promo-title" name="title" maxLength={200}
                    placeholder="20% off selected services" className={inputClass}/></div>
                <div><label htmlFor="promo-description" className={labelClass}>Terms (optional)</label>
                  <textarea id="promo-description" name="description" maxLength={3000}
                    rows={2} className={inputClass}/></div>
                <div><label htmlFor="promo-url" className={labelClass}>Destination URL</label>
                  <input id="promo-url" name="destination_url" type="url" required
                    placeholder="https://yourshop.co.uk/offer" className={inputClass}/></div>
                <div><label htmlFor="promo-expires" className={labelClass}>Expiry date (optional)</label>
                  <input id="promo-expires" name="expires_at" type="date" className={inputClass}/></div>
                <button type="submit" className={buttonClass}>Submit for approval</button>
              </form>
            )}
          </section>
        </>
      )}
    </main>
  );
}
