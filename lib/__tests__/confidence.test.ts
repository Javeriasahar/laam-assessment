import { describe, it, expect } from "vitest";
import { computeConfidence, findAlternatives } from "@/lib/confidence";
import { products } from "@/data/seed";

const p1 = products.find((p) => p.id === "p1")!; // everything good
const p2 = products.find((p) => p.id === "p2")!; // low stock, volatile price, remote weak
const p3 = products.find((p) => p.id === "p3")!; // size fully out of stock
const p4 = products.find((p) => p.id === "p4")!; // volatile price, poor remote delivery, no COD

describe("computeConfidence", () => {
  it("returns high confidence when stock, delivery, and price are all favorable", () => {
    const result = computeConfidence(p1, "M", "same_city");
    expect(result.level).toBe("high");
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  it("penalizes low stock without zeroing it out", () => {
    const result = computeConfidence(p2, "S", "major_city"); // S has 1 unit left
    const stockFactor = result.factors.find((f) => f.key === "stock");
    expect(stockFactor?.status).toBe("warning");
  });

  it("forces level to low when the selected size is out of stock, regardless of other factors", () => {
    // p3 has strong delivery + stable price, but size M has 0 stock.
    const result = computeConfidence(p3, "M", "major_city");
    const stockFactor = result.factors.find((f) => f.key === "stock");
    expect(stockFactor?.status).toBe("bad");
    expect(result.level).toBe("low");
  });

  it("flags poor delivery reliability for remote zones", () => {
    const result = computeConfidence(p4, "M", "remote");
    const deliveryFactor = result.factors.find((f) => f.key === "delivery");
    expect(deliveryFactor?.status).toBe("bad");
  });

  it("flags price volatility when price has changed multiple times", () => {
    const result = computeConfidence(p4, "M", "same_city");
    const priceFactor = result.factors.find((f) => f.key === "price");
    expect(priceFactor?.status).not.toBe("good");
  });

  it("reflects no-COD as a weaker safety net than COD available", () => {
    const withCod = computeConfidence(p1, "M", "same_city");
    const withoutCod = computeConfidence(p4, "M", "same_city");
    const safetyWith = withCod.factors.find((f) => f.key === "safety_net");
    const safetyWithout = withoutCod.factors.find((f) => f.key === "safety_net");
    expect(safetyWith?.status).toBe("good");
    expect(safetyWithout?.status).not.toBe("good");
  });

  it("treats no size selected as a warning, not a hard block", () => {
    const result = computeConfidence(p1, null, "same_city");
    const stockFactor = result.factors.find((f) => f.key === "stock");
    expect(stockFactor?.status).toBe("warning");
  });

  it("never returns a score outside 0-100", () => {
    for (const p of products) {
      for (const v of p.variants) {
        for (const zone of p.deliveryZones) {
          const result = computeConfidence(p, v.size, zone.zone);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("surfaces an 'alternate sizes available' factor when the chosen size is out but others aren't", () => {
    const result = computeConfidence(p3, "M", "major_city"); // M is 0 stock, other sizes have stock
    const altFactor = result.factors.find((f) => f.key === "alt_sizes");
    expect(altFactor).toBeDefined();
    expect(altFactor?.status).toBe("good");
  });
});

describe("findAlternatives", () => {
  it("only suggests products from the same category", () => {
    const alts = findAlternatives(p3, products, "M");
    expect(alts.every((a) => a.category === p3.category)).toBe(true);
  });

  it("never suggests the product itself", () => {
    const alts = findAlternatives(p1, products, "M");
    expect(alts.some((a) => a.id === p1.id)).toBe(false);
  });

  it("prioritizes alternatives where the preferred size is in stock", () => {
    // p2 size XL is 0 stock; alternatives should prefer products with XL available
    const alts = findAlternatives(p2, products, "XL", 5);
    const firstAlt = alts[0];
    const firstVariant = firstAlt?.variants.find((v) => v.size === "XL");
    if (alts.length > 1 && firstVariant) {
      expect(firstVariant.stock).toBeGreaterThan(0);
    }
  });

  it("respects the limit parameter", () => {
    const alts = findAlternatives(p1, products, "M", 2);
    expect(alts.length).toBeLessThanOrEqual(2);
  });
});
