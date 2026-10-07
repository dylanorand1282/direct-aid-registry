import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "good" | "partial" | "review" | "critical" | "unverified";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-neutral-soft text-neutral",
  accent: "bg-accent-soft text-accent-strong",
  good: "bg-good-soft text-good",
  partial: "bg-partial-soft text-partial",
  review: "bg-review-soft text-review",
  critical: "bg-critical-soft text-critical",
  // Deliberately not a warning colour: a check that could not be done is not a failure.
  unverified: "border border-dashed border-rule-strong bg-paper text-ink-muted",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
