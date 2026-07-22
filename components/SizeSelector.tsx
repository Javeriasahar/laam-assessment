"use client";

import { Variant, SizeCode } from "@/lib/types";

export function SizeSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: Variant[];
  selected: SizeCode | null;
  onSelect: (size: SizeCode) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
        Size
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selected === v.size;
          const outOfStock = v.stock === 0;
          const low = !outOfStock && v.stock <= v.lowStockThreshold;
          return (
            <button
              key={v.size}
              onClick={() => onSelect(v.size)}
              disabled={outOfStock}
              className="relative min-w-[52px] px-3 py-2 rounded-md text-sm font-medium border transition-colors"
              style={{
                borderColor: isSelected ? "var(--ink)" : "var(--ivory-deep)",
                background: isSelected ? "var(--ink)" : "transparent",
                color: outOfStock ? "var(--ink)" : isSelected ? "var(--ivory)" : "var(--ink)",
                opacity: outOfStock ? 0.35 : 1,
                cursor: outOfStock ? "not-allowed" : "pointer",
                textDecoration: outOfStock ? "line-through" : "none",
              }}
              title={outOfStock ? "Out of stock" : low ? `Only ${v.stock} left` : `${v.stock} in stock`}
            >
              {v.size}
              {low && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--warn)" }}
                />
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-xs mt-2" style={{ color: "var(--ink)", opacity: 0.55 }}>
          {(() => {
            const v = variants.find((v) => v.size === selected);
            if (!v) return null;
            if (v.stock <= v.lowStockThreshold) return `Only ${v.stock} left in ${selected}`;
            return `${v.stock} in stock`;
          })()}
        </p>
      )}
    </div>
  );
}
