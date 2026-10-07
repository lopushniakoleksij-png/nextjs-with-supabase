import { redirect } from "next/navigation";

export default async function LegacyPromoStorePage({
  params,
}: {
  params: Promise<{ store_slug: string }>;
}) {
  const { store_slug } = await params;
  redirect(`/store/${store_slug}`);
}
