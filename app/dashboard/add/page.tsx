import { addPromoCode } from "@/app/actions/add-promo-code";

export default function AddPromoCodePage() {
  return (
    <div className="p-6">
      <form action={addPromoCode} className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Add Promo Code</h1>

        <input
          name="code"
          placeholder="SAVE20"
          required
          className="border p-2 w-full"
        />

        <input
          name="store_slug"
          placeholder="store-slug"
          required
          className="border p-2 w-full"
        />

        <input
          name="title"
          placeholder="20% off selected items"
          className="border p-2 w-full"
        />

        <textarea
          name="description"
          placeholder="Optional description"
          className="border p-2 w-full"
        />

        <input
          type="url"
          name="destination_url"
          placeholder="https://merchant.example/offer"
          required
          className="border p-2 w-full"
        />

        <input
          type="date"
          name="expires_at"
          className="border p-2 w-full"
        />

        <p className="text-sm text-gray-500">
          New submissions remain pending until an administrator approves them.
        </p>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Submit promo code
        </button>
      </form>
    </div>
  );
}
