"use client";

import { DeliveryZone } from "@/lib/types";

const ZONE_LABELS: Record<DeliveryZone["zone"], string> = {
  same_city: "Same city",
  major_city: "Major city",
  remote: "Remote / other",
};

export function DeliverySelector({
  zones,
  selected,
  onSelect,
}: {
  zones: DeliveryZone[];
  selected: DeliveryZone["zone"];
  onSelect: (zone: DeliveryZone["zone"]) => void;
}) {
  const activeZone = zones.find((z) => z.zone === selected);
  return (
    <div>
      <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>
        Delivering to
      </p>
      <div className="flex gap-2">
        {zones.map((z) => {
          const isSelected = z.zone === selected;
          return (
            <button
              key={z.zone}
              onClick={() => onSelect(z.zone)}
              className="px-3 py-2 rounded-md text-sm border transition-colors"
              style={{
                borderColor: isSelected ? "var(--ink)" : "var(--ivory-deep)",
                background: isSelected ? "var(--ink)" : "transparent",
                color: isSelected ? "var(--ivory)" : "var(--ink)",
              }}
            >
              {ZONE_LABELS[z.zone]}
            </button>
          );
        })}
      </div>
      {activeZone && (
        <p className="text-xs mt-2" style={{ color: "var(--ink)", opacity: 0.55 }}>
          Estimated {activeZone.minDays}–{activeZone.maxDays} days · {activeZone.onTimeRatePct}% on-time
          historically
        </p>
      )}
    </div>
  );
}
