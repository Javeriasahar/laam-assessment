"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, SizeCode, DeliveryZone, ConfidenceResult } from "@/lib/types";
import { SizeSelector } from "@/components/SizeSelector";
import { DeliverySelector } from "@/components/DeliverySelector";
import { ConfidenceDial } from "@/components/ConfidenceDial";
import { ConfidenceFactors } from "@/components/ConfidenceFactors";
import { Alternatives } from "@/components/Alternatives";

interface AltProduct {
  id: string;
  brand: string;
  title: string;
  images: string[];
  currentPrice: number;
  rating: number;
}

export function ProductClient({ product }: { product: Product }) {
  const [size, setSize] = useState<SizeCode | null>(null);
  const [zone, setZone] = useState<DeliveryZone["zone"]>("major_city");
  const [confidence, setConfidence] = useState<ConfidenceResult | null>(null);
  const [alternatives, setAlternatives] = useState<AltProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const fetchConfidence = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ zone });
    if (size) params.set("size", size);
    try {
      const res = await fetch(`/api/products/${product.id}/confidence?${params.toString()}`);
      const data = await res.json();
      setConfidence(data.confidence);
      setAlternatives(data.alternatives ?? []);
    } finally {
      setLoading(false);
    }
  }, [product.id, size, zone]);

  useEffect(() => {
    fetchConfidence();
  }, [fetchConfidence]);

  const hasDiscount = product.discountPct > 0;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <a href="/" className="text-sm" style={{ color: "var(--ink)", opacity: 0.55 }}>
        ← Back to shop
      </a>

      <div className="mt-6 grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[var(--ivory-deep)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[activeImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className="w-16 h-20 rounded-md overflow-hidden border-2"
                style={{ borderColor: i === activeImage ? "var(--ink)" : "transparent" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details + purchase panel */}
        <div>
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--bronze)" }}>
            {product.brand}
          </p>
          <h1 className="font-display text-3xl mt-1 leading-tight" style={{ color: "var(--ink)" }}>
            {product.title}
          </h1>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-data text-2xl" style={{ color: "var(--ink)" }}>
              Rs {product.currentPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="font-data text-base line-through" style={{ color: "var(--ink)", opacity: 0.4 }}>
                  Rs {product.basePrice.toLocaleString()}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--rose)" }}>
                  {product.discountPct}% off
                </span>
              </>
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--ink)", opacity: 0.55 }}>
            {product.fabric} · {product.rating}★ ({product.reviewCount} reviews)
          </p>

          <div className="mt-6 space-y-5">
            <SizeSelector variants={product.variants} selected={size} onSelect={setSize} />
            <DeliverySelector zones={product.deliveryZones} selected={zone} onSelect={setZone} />
          </div>

          {/* Confidence panel */}
          <div
            className="mt-8 rounded-xl p-5"
            style={{ background: "#FFFFFF", border: "1px solid var(--ivory-deep)" }}
          >
            {confidence ? (
              <>
                <ConfidenceDial result={confidence} />
                <ConfidenceFactors factors={confidence.factors} />
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--ink)", opacity: 0.5 }}>
                {loading ? "Checking availability…" : "Select a size to see your confidence score."}
              </p>
            )}
          </div>

          <button
            className="mt-6 w-full py-3.5 rounded-md font-medium text-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--rose)", color: "var(--ivory)" }}
            disabled={!size}
          >
            {size ? "Add to Cart" : "Select a size to continue"}
          </button>

          <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--ink)", opacity: 0.55 }}>
            <span>{product.codAvailable ? "✓ Cash on Delivery" : "Prepaid only"}</span>
            <span>·</span>
            <span>{product.returnWindowDays}-day returns</span>
          </div>
        </div>
      </div>

      <Alternatives items={alternatives} />
    </div>
  );
}
