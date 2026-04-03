import { addPromoCode } from "@/app/actions/add-promo-code";

export default function AddPromoCodePage() {
  return (
    <div className="max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-6">
        ➕ Add Promo Code
      </h1>

      <form action={addPromoCode} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Store</label>
          <input
            name="store"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Amazon, Tesco, Argos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Promo Code</label>
          <input
            name="code"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="SAVE20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Description (optional)
          </label>
          <textarea
            name="description"
            className="w-full border rounded px-3 py-2"
            placeholder="20% off electronics"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Save promo code
        </button>
      </form>
    </div>
  );
}
