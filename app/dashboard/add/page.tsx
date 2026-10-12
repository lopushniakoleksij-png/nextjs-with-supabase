import { addPromoCode } from "@/app/actions/add-promo-code";

const fieldClassName =
  "block box-border min-h-11 w-full min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900";

const labelClassName = "mb-1 block text-sm font-semibold text-slate-800";

export default function AddPromoCodePage() {
  return (
    <div className="min-w-0 max-w-full">
      <form action={addPromoCode} className="w-full min-w-0 max-w-lg space-y-4">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          Add Promo Code
        </h1>

        <div className="min-w-0">
          <label htmlFor="promo-code" className={labelClassName}>
            Promo code
          </label>
          <input
            id="promo-code"
            name="code"
            placeholder="SAVE20"
            required
            autoCorrect="off"
            spellCheck={false}
            className={fieldClassName}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="store-slug" className={labelClassName}>
            Store slug
          </label>
          <input
            id="store-slug"
            name="store_slug"
            placeholder="store-slug"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={fieldClassName}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="promo-title" className={labelClassName}>
            Offer title (optional)
          </label>
          <input
            id="promo-title"
            name="title"
            placeholder="20% off selected items"
            className={fieldClassName}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="promo-description" className={labelClassName}>
            Description (optional)
          </label>
          <textarea
            id="promo-description"
            name="description"
            placeholder="Offer terms and exclusions"
            rows={3}
            className={fieldClassName}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="destination-url" className={labelClassName}>
            Destination URL
          </label>
          <input
            id="destination-url"
            type="url"
            name="destination_url"
            placeholder="https://merchant.example/offer"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={fieldClassName}
          />
        </div>

        <div className="min-w-0 max-w-full">
          <label htmlFor="promo-expiry" className={labelClassName}>
            Expiry date (optional)
          </label>
          <input
            id="promo-expiry"
            type="date"
            name="expires_at"
            aria-describedby="promo-expiry-help"
            className={fieldClassName + " appearance-none"}
            style={{ minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}
          />
          <p id="promo-expiry-help" className="mt-1 text-xs text-slate-600">
            Leave blank if the offer has no known expiry date.
          </p>
        </div>

        <p className="text-sm text-slate-600">
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
