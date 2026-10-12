import { createClient } from "@/lib/supabase/server";
import { createStore, toggleStore } from "@/app/actions/stores";

type StoreRow = {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  is_active: boolean;
};

export default async function StoresAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug, website_url, is_active")
    .order("name");

  if (error) throw new Error(error.message);

  const stores = (data || []) as StoreRow[];

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">Stores</h1>
        <form action={createStore} className="grid w-full max-w-xl gap-3">
          <input name="name" placeholder="Store name" required className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2" />
          <input name="slug" placeholder="store-name" required className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2" />
          <input name="website_url" type="url" placeholder="https://store.example" className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2" />
          <input name="affiliate_url" type="url" placeholder="https://affiliate.example/..." className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2" />
          <button className="min-h-11 w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white sm:w-fit">
            Add store
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {stores.length === 0 ? (
          <p>No stores yet.</p>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="break-words font-semibold">{store.name}</p>
                <p className="break-all text-sm text-gray-500">/{store.slug}</p>
                {store.website_url && (
                  <p className="text-sm text-gray-500">{store.website_url}</p>
                )}
              </div>
              <form
                action={async () => {
                  "use server";
                  await toggleStore(store.id, store.is_active);
                }}
              >
                <button className="min-h-11 min-w-24 rounded-lg border border-slate-300 px-4 py-2 font-medium">
                  {store.is_active ? "Disable" : "Enable"}
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
