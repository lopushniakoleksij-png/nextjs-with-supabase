import { addPromoCode } from "@/app/actions/add-promo-code";

export default function AddPromoCodePage() {
  return (
    <div className="p-6">
      <form action={addPromoCode} className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Add Promo Code</h1>

        <input
          name="code"
          placeholder="PROMO2025"
          required
          className="border p-2 w-full"
        />

        <input
          name="store_slug"
          placeholder="amazon"
          required
          className="border p-2 w-full"
        />

        <textarea
          name="description"
          placeholder="Optional description"
          className="border p-2 w-full"
        />

        <input
          type="date"
          name="expires_at"
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save promo code
        </button>
      </form>
    </div>
  );
}
