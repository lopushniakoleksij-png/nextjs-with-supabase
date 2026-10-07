import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://nextjs-with-supabase-neon-ten.vercel.app"
  ).replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const home: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  if (!supabaseUrl || !anonKey) {
    return home;
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const { data: stores, error } = await supabase
    .from("stores")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (error || !stores) {
    return home;
  }

  return [
    ...home,
    ...stores.map((store) => ({
      url: `${baseUrl}/store/${store.slug}`,
      lastModified: store.updated_at
        ? new Date(store.updated_at)
        : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
