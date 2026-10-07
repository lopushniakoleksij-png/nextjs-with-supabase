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
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Stores</h1>
        <form action={createStore} className="grid gap-3 max-w-xl">
          <input name="name" placeholder="Store name" required className="border p-2" />
          <input name="slug" placeholder="store-name" required className="border p-2" />
          <input name="website_url" type="url" placeholder="https://store.example" className="border p-2" />
          <input name="affiliate_url" type="url" placeholder="https://affiliate.example/..." className="border p-2" />
          <button className="bg-black text-white px-4 py-2 rounded w-fit">
            Add store
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {stores.length === 0 ? (
          <p>No stores yet.</p>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="border rounded p-4 flex justify-between gap-4">
              <div>
                <p className="font-semibold">{store.name}</p>
                <p className="text-sm text-gray-500">/{store.slug}</p>
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
                <button className="border px-3 py-1 rounded">
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
