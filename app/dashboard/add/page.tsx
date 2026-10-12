import { addPromoCode } from "@/app/actions/add-promo-code";

export default function AddPromoCodePage() {
  return (
    <div className="min-w-0">
      <form action={addPromoCode} className="w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">Add Promo Code</h1>

        <input
          name="code"
          placeholder="SAVE20"
          required
          className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2"
        />

        <input
          name="store_slug"
          placeholder="store-slug"
          required
          className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2"
        />

        <input
          name="title"
          placeholder="20% off selected items"
          className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2"
        />

        <textarea
          name="description"
          placeholder="Optional description"
          className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2"
        />

        <input
          type="url"
          name="destination_url"
          placeholder="https://merchant.example/offer"
          required
          className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2"
        />

        <input
          type="date"
          name="expires_at"
          className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2"
        />

        <p className="text-sm text-gray-500">
          New submissions remain pending until an administrator approves them.
        </p>

        <button
          type="submit"
          className="min-h-11 w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white sm:w-auto"
        >
          Submit promo code
        </button>
      </form>
    </div>
  );
}
