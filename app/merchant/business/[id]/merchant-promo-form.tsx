"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { submitMerchantPromo } from "@/app/actions/merchant-office";

type Store = { id: string; name: string };
type Item = { id: string; store_id: string; name: string; is_active: boolean };

const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="min-h-11 rounded-lg bg-slate-900 px-5 py-2 font-semibold text-white disabled:opacity-50">
      {pending ? "Submitting for review..." : "Submit for approval"}
    </button>
  );
}

export default function MerchantPromoForm({
  organizationId,
  stores,
  items,
}: {
  organizationId: string;
  stores: Store[];
  items: Item[];
}) {
  const [storeId, setStoreId] = useState(stores[0]?.id || "");
  const availableItems = items.filter(i => i.store_id === storeId && i.is_active);
  if (!stores.length) return null;

  return (
    <form action={submitMerchantPromo}
      className="max-w-2xl space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold">Submit a new promotion</h3>
      <input type="hidden" name="organization_id" value={organizationId}/>
      <div>
        <label htmlFor="promo-store" className={labelClass}>Shop/branch</label>
        <select id="promo-store" name="store_id" required className={inputClass}
          value={storeId} onChange={(e) => setStoreId(e.target.value)}>
          {stores.map(store => (
            <option key={store.id} value={store.id}>{store.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="promo-item" className={labelClass}>Product/service (optional)</label>
        <select id="promo-item" name="item_id" className={inputClass}
          key={storeId} defaultValue="">
          <option value="">Shop-wide discount</option>
          {availableItems.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Only products and services from the selected shop are available.
        </p>
      </div>
      <div>
        <label htmlFor="promo-code" className={labelClass}>Promo code</label>
        <input id="promo-code" name="code" required maxLength={80} className={inputClass}
          autoCorrect="off" spellCheck={false} placeholder="SAVE20"/>
      </div>
      <div>
        <label htmlFor="promo-title" className={labelClass}>Offer title (optional)</label>
        <input id="promo-title" name="title" maxLength={200} className={inputClass}
          placeholder="20% off selected services"/>
      </div>
      <div>
        <label htmlFor="promo-description" className={labelClass}>Terms (optional)</label>
        <textarea id="promo-description" name="description" rows={2}
          maxLength={3000} className={inputClass}/>
      </div>
      <div>
        <label htmlFor="promo-url" className={labelClass}>Destination URL</label>
        <input id="promo-url" name="destination_url" type="url" required className={inputClass}
          placeholder="https://yourshop.co.uk/offer"/>
      </div>
      <div>
        <label htmlFor="promo-expires" className={labelClass}>Expiry date (optional)</label>
        <input id="promo-expires" name="expires_at" type="date" className={inputClass}/>
      </div>
      <p className="text-sm text-slate-600">
        Promotions stay pending until approved by the platform administrator.
      </p>
      <SubmitButton/>
    </form>
  );
}
