export type SizeCode = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface Variant {
  size: SizeCode;
  stock: number; // units currently in stock
  lowStockThreshold: number; // below this, flag as "low stock"
}

export interface PricePoint {
  date: string; // ISO date
  price: number; // PKR
}

export interface DeliveryZone {
  zone: "same_city" | "major_city" | "remote";
  minDays: number;
  maxDays: number;
  onTimeRatePct: number; // historical % of orders in this zone delivered within promised window
}

export interface Product {
  id: string;
  brand: string;
  title: string;
  images: string[];
  category: string;
  basePrice: number; // original / MSRP, PKR
  currentPrice: number; // current selling price, PKR
  discountPct: number; // derived, but stored for clarity
  priceHistory: PricePoint[]; // last few price points, used for "price stability" signal
  fabric: string;
  colorFamily: string;
  variants: Variant[];
  deliveryZones: DeliveryZone[];
  codAvailable: boolean;
  returnWindowDays: number;
  rating: number;
  reviewCount: number;
  tags: string[]; // used for "similar alternatives" matching
}

export interface ConfidenceFactor {
  key: string;
  label: string;
  status: "good" | "warning" | "bad";
  detail: string;
}

export interface ConfidenceResult {
  score: number; // 0-100
  level: "high" | "medium" | "low";
  factors: ConfidenceFactor[];
}
