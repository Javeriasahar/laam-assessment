import { Product, SizeCode, ConfidenceResult, ConfidenceFactor, DeliveryZone } from "@/lib/types";

/**
 * Computes a purchase confidence score for a product + selected size + delivery zone.
 *
 * Weighting rationale (documented for transparency, since this is the one
 * "invented" business rule in the whole app):
 *  - Stock/availability: 35 pts  — the single biggest driver of a failed order
 *  - Delivery reliability: 30 pts — directly answers "can I trust the promise"
 *  - Price stability: 20 pts     — recent volatility signals the price shown may not "stick"
 *  - Returns/COD safety net: 15 pts — reduces perceived risk of a wrong decision
 */
export function computeConfidence(
  product: Product,
  size: SizeCode | null,
  zoneKey: DeliveryZone["zone"]
): ConfidenceResult {
  const factors: ConfidenceFactor[] = [];
  let score = 0;

  // --- Stock factor (35 pts) ---
  const variant = size ? product.variants.find((v) => v.size === size) : null;
  if (!size) {
    factors.push({
      key: "stock",
      label: "Size availability",
      status: "warning",
      detail: "Select a size to check stock",
    });
  } else if (!variant || variant.stock === 0) {
    const hasOtherSizesInStock = product.variants.some((v) => v.size !== size && v.stock > 0);
    factors.push({
      key: "stock",
      label: "Size availability",
      status: "bad",
      detail: `Size ${size} is unavailable`,
    });
    if (hasOtherSizesInStock) {
      factors.push({
        key: "alt_sizes",
        label: "Alternate sizes",
        status: "good",
        detail: "Alternative sizes available",
      });
    }
  } else if (variant.stock <= variant.lowStockThreshold) {
    score += 20;
    factors.push({
      key: "stock",
      label: "Size availability",
      status: "warning",
      detail: `Only ${variant.stock} left in size ${size}`,
    });
  } else {
    score += 35;
    factors.push({
      key: "stock",
      label: "Size availability",
      status: "good",
      detail: `Size ${size} is in stock`,
    });
  }

  // --- Delivery factor (30 pts) ---
  const zone = product.deliveryZones.find((z) => z.zone === zoneKey);
  if (zone) {
    if (zone.onTimeRatePct >= 90) {
      score += 30;
      factors.push({
        key: "delivery",
        label: "Delivery reliability",
        status: "good",
        detail: `Delivery expected in ${zone.minDays}–${zone.maxDays} days`,
      });
    } else if (zone.onTimeRatePct >= 75) {
      score += 16;
      factors.push({
        key: "delivery",
        label: "Delivery reliability",
        status: "warning",
        detail: `Delivery in ${zone.minDays}–${zone.maxDays} days, some delays common in this area`,
      });
    } else {
      score += 5;
      factors.push({
        key: "delivery",
        label: "Delivery reliability",
        status: "bad",
        detail: `Delivery to this area is often delayed (${zone.onTimeRatePct}% on-time)`,
      });
    }
  }

  // --- Price stability factor (20 pts) ---
  const history = product.priceHistory;
  if (history.length >= 2) {
    const first = history[0].price;
    const last = history[history.length - 1].price;
    const swings = history.slice(1).filter((p, i) => p.price !== history[i].price).length;
    const pctChange = Math.abs((last - first) / first) * 100;

    if (swings === 0) {
      score += 20;
      factors.push({
        key: "price",
        label: "Price stability",
        status: "good",
        detail: "Final price shown includes no recent changes",
      });
    } else if (pctChange <= 15 && swings <= 2) {
      score += 12;
      factors.push({
        key: "price",
        label: "Price stability",
        status: "warning",
        detail: `Price has changed ${swings}x recently (${pctChange.toFixed(0)}% net change)`,
      });
    } else {
      score += 4;
      factors.push({
        key: "price",
        label: "Price stability",
        status: "bad",
        detail: `Price has moved ${swings}x in the last month, may change again`,
      });
    }
  }

  // --- Returns / COD safety net factor (15 pts) ---
  let safetyScore = 0;
  const notes: string[] = [];
  if (product.codAvailable) {
    safetyScore += 8;
    notes.push("Cash on Delivery available");
  } else {
    notes.push("Prepaid only");
  }
  if (product.returnWindowDays >= 14) {
    safetyScore += 7;
    notes.push(`${product.returnWindowDays}-day returns`);
  } else if (product.returnWindowDays > 0) {
    safetyScore += 4;
    notes.push(`${product.returnWindowDays}-day returns`);
  } else {
    notes.push("No returns");
  }
  score += safetyScore;
  factors.push({
    key: "safety_net",
    label: "Risk safety net",
    status: safetyScore >= 12 ? "good" : safetyScore >= 6 ? "warning" : "bad",
    detail: product.returnWindowDays > 0 ? `Eligible for returns (${product.returnWindowDays} days)` : notes.join(" · "),
  });

  score = Math.round(score);
  const stockFactor = factors.find((f) => f.key === "stock");
  const isBlocked = stockFactor?.status === "bad"; // out of stock in selected size

  // A hard blocker (out of stock) overrides the weighted score: no amount of
  // good delivery or pricing makes an unbuyable size a "medium confidence" buy.
  const level: ConfidenceResult["level"] = isBlocked
    ? "low"
    : score >= 75
    ? "high"
    : score >= 45
    ? "medium"
    : "low";

  return { score, level, factors };
}

/**
 * Finds alternative products when the current selection is risky —
 * matched primarily by category + overlapping tags, then sorted by
 * how likely the preferred size is to be in stock.
 */
export function findAlternatives(
  product: Product,
  allProducts: Product[],
  preferredSize: SizeCode | null,
  limit = 3
): Product[] {
  const candidates = allProducts.filter((p) => p.id !== product.id && p.category === product.category);

  const scored = candidates.map((p) => {
    const tagOverlap = p.tags.filter((t) => product.tags.includes(t)).length;
    const variant = preferredSize ? p.variants.find((v) => v.size === preferredSize) : null;
    const sizeAvailable = variant ? variant.stock > 0 : true;
    return { product: p, tagOverlap, sizeAvailable };
  });

  scored.sort((a, b) => {
    if (a.sizeAvailable !== b.sizeAvailable) return a.sizeAvailable ? -1 : 1;
    return b.tagOverlap - a.tagOverlap;
  });

  return scored.slice(0, limit).map((s) => s.product);
}
