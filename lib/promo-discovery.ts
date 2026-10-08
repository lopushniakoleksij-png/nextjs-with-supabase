/** Canonical, side-effect-free promotion search/ranking rules.
 * The server decides which offers may be published. This module only
 * orders and filters ALREADY authorised rows, never grants visibility.
 */
export type PromoItem = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  created_at: string | null;
  worked_count: number | null;
  failed_count: number | null;
  click_count: number | null;
  stores: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

export type SortOrder = "newest" | "helpful" | "expiring";

export function promoStore(promo: PromoItem): { name: string; slug: string } | null {
  return (Array.isArray(promo.stores) ? promo.stores[0] : promo.stores) || null;
}

export function voteCounts(promo: PromoItem) {
  const worked = Math.max(0, promo.worked_count || 0);
  const failed = Math.max(0, promo.failed_count || 0);
  return { worked, failed, total: worked + failed };
}

/** Lower bound of 95% Wilson confidence interval; avoids ranking 1/1 above 90/100. */
export function evidenceScore(promo: PromoItem): number {
  const { worked, total } = voteCounts(promo);
  if (!total) return -1;
  const z = 1.96;
  const p = worked / total;
  const z2 = z * z;
  return (p + z2 / (2 * total) - z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total)) /
    (1 + z2 / total);
}

export function findPromos(
  promos: readonly PromoItem[],
  query: string,
  sort: SortOrder = "newest",
): PromoItem[] {
  const term = query.trim().toLocaleLowerCase("en-GB");
  const filtered = promos.filter((promo) => {
    const store = promoStore(promo);
    return [promo.code, promo.title || "", promo.description || "", store?.name || ""]
      .some((value) => value.toLocaleLowerCase("en-GB").includes(term));
  });

  return filtered.sort((a, b) => {
    if (sort === "helpful") {
      return evidenceScore(b) - evidenceScore(a) || voteCounts(b).total - voteCounts(a).total ||
        (b.created_at || "").localeCompare(a.created_at || "");
    }
    if (sort === "expiring") {
      return (a.expires_at ? Date.parse(a.expires_at) : Infinity) -
        (b.expires_at ? Date.parse(b.expires_at) : Infinity);
    }
    return (b.created_at || "").localeCompare(a.created_at || "");
  });
}
