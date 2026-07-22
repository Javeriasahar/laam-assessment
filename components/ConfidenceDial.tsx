"use client";

import { ConfidenceResult } from "@/lib/types";

const LEVEL_COPY: Record<ConfidenceResult["level"], { verdict: string; sub: string }> = {
  high: { verdict: "Buy with confidence", sub: "Everything checks out for this order." },
  medium: { verdict: "Worth a closer look", sub: "A couple of things could go your way or not." },
  low: { verdict: "Proceed carefully", sub: "This order carries real risk — see why below." },
};

const LEVEL_COLOR: Record<ConfidenceResult["level"], string> = {
  high: "var(--good)",
  medium: "var(--warn)",
  low: "var(--bad)",
};

export function ConfidenceDial({ result }: { result: ConfidenceResult }) {
  const { score, level } = result;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = LEVEL_COLOR[level];

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="var(--ivory-deep)"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 500ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-data text-3xl font-medium" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--ink)]/50">
            of 100
          </span>
        </div>
      </div>
      <div>
        <p className="font-display text-xl leading-tight" style={{ color }}>
          {LEVEL_COPY[level].verdict}
        </p>
        <p className="text-sm text-[var(--ink)]/65 mt-1">{LEVEL_COPY[level].sub}</p>
      </div>
    </div>
  );
}
