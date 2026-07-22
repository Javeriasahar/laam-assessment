"use client";

interface AltProduct {
  id: string;
  brand: string;
  title: string;
  images: string[];
  currentPrice: number;
  rating: number;
}

export function Alternatives({ items }: { items: AltProduct[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <p className="font-display text-lg" style={{ color: "var(--ink)" }}>
        You might also like
      </p>
      <p className="text-sm mt-1 mb-4" style={{ color: "var(--ink)", opacity: 0.6 }}>
        Similar styles with better availability right now.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((p) => (
          <a
            key={p.id}
            href={`/product/${p.id}`}
            className="group block rounded-lg overflow-hidden border"
            style={{ borderColor: "var(--ivory-deep)" }}
          >
            <div className="aspect-[3/4] overflow-hidden bg-[var(--ivory-deep)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.images[0]}
                alt={p.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-3">
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--bronze)" }}>
                {p.brand}
              </p>
              <p className="text-sm mt-0.5 leading-snug" style={{ color: "var(--ink)" }}>
                {p.title}
              </p>
              <p className="font-data text-sm mt-1.5" style={{ color: "var(--ink)" }}>
                Rs {p.currentPrice.toLocaleString()}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
