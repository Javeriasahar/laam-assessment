import { NextResponse } from "next/server";
import { products } from "@/data/seed";
import { computeConfidence, findAlternatives } from "@/lib/confidence";
import { SizeCode, DeliveryZone } from "@/lib/types";

const VALID_SIZES: SizeCode[] = ["XS", "S", "M", "L", "XL", "XXL"];
const VALID_ZONES: DeliveryZone["zone"][] = ["same_city", "major_city", "remote"];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const sizeParam = searchParams.get("size");
  const zoneParam = searchParams.get("zone") ?? "major_city";

  const size = sizeParam && VALID_SIZES.includes(sizeParam as SizeCode) ? (sizeParam as SizeCode) : null;
  const zone: DeliveryZone["zone"] = VALID_ZONES.includes(zoneParam as DeliveryZone["zone"])
    ? (zoneParam as DeliveryZone["zone"])
    : "major_city";

  const confidence = computeConfidence(product, size, zone);
  const alternatives =
    confidence.level !== "high"
      ? findAlternatives(product, products, size).map((p) => ({
          id: p.id,
          brand: p.brand,
          title: p.title,
          images: p.images,
          currentPrice: p.currentPrice,
          rating: p.rating,
        }))
      : [];

  return NextResponse.json({ confidence, alternatives });
}
