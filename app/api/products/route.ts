import { NextResponse } from "next/server";
import { products } from "@/data/seed";

export async function GET() {
  const summary = products.map((p) => ({
    id: p.id,
    brand: p.brand,
    title: p.title,
    images: p.images,
    currentPrice: p.currentPrice,
    basePrice: p.basePrice,
    discountPct: p.discountPct,
    rating: p.rating,
  }));
  return NextResponse.json({ products: summary });
}
