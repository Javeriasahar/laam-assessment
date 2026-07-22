import { products } from "@/data/seed";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--ivory)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--bronze)" }}>
          LAAM · Assessment Build
        </p>
        <h1 className="font-display text-4xl mt-2" style={{ color: "var(--ink)" }}>
          Shop with confidence
        </h1>
        <p className="text-sm mt-2 max-w-md" style={{ color: "var(--ink)", opacity: 0.6 }}>
          Every product page shows a live purchase-confidence score — size availability,
          delivery reliability, price stability, and a safety net, all in one glance.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-10">
          {products.map((p) => (
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
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="font-data text-sm" style={{ color: "var(--ink)" }}>
                    Rs {p.currentPrice.toLocaleString()}
                  </span>
                  {p.discountPct > 0 && (
                    <span className="text-xs line-through" style={{ color: "var(--ink)", opacity: 0.4 }}>
                      Rs {p.basePrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
