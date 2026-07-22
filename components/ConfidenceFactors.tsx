import { ConfidenceFactor } from "@/lib/types";

const STATUS_STYLE: Record<ConfidenceFactor["status"], { fg: string; mark: string }> = {
  good: { fg: "var(--good)", mark: "✓" },
  warning: { fg: "var(--warn)", mark: "⚠" },
  bad: { fg: "var(--bad)", mark: "✕" },
};

export function ConfidenceFactors({ factors }: { factors: ConfidenceFactor[] }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--ink)", opacity: 0.5 }}>
        Why?
      </p>
      <ul className="mt-2.5 space-y-2">
        {factors.map((f) => {
          const style = STATUS_STYLE[f.status];
          return (
            <li key={f.key} className="flex items-start gap-2.5">
              <span
                className="text-sm leading-[1.4] shrink-0"
                style={{ color: style.fg }}
                aria-hidden="true"
              >
                {style.mark}
              </span>
              <span className="text-sm leading-[1.4]" style={{ color: "var(--ink)", opacity: 0.85 }}>
                {f.detail}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
