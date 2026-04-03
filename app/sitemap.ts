import { createClient } from "@supabase/supabase-js";

export default async function sitemap() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ FETCH STORES
  const { data: stores } = await supabase
    .from("stores")
    .select("slug");

  // 🔥 IMPORTANT: USE REAL DOMAIN
  const baseUrl = "http://localhost:3000"; // ← change later to Vercel

  const storeUrls =
    stores?.map((store) => ({
      url: `${baseUrl}/store/${store.slug}`,
      lastModified: new Date(),
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...storeUrls,
  ];
}