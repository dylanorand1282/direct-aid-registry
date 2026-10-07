import type { Funder } from "@/data/types";

export function decisionTone(days: number) {
  return days <= 30 ? "text-good" : days <= 60 ? "text-ink" : "text-critical";
}

export function FunderFigures({ funder }: { funder: Funder }) {
  const m = funder.metrics;
  const items = [
    { label: "Decision", value: `${m.medianDecisionDays} days`, tone: decisionTone(m.medianDecisionDays) },
    { label: "Payment", value: `${m.medianPaymentDays} days`, tone: decisionTone(m.medianPaymentDays * 2) },
    { label: "Unrestricted", value: `${m.unrestrictedSharePercent}%`, tone: m.unrestrictedSharePercent >= 50 ? "text-good" : "text-ink" },
    { label: "Overhead allowed", value: `${m.overheadAllowedPercent}%`, tone: m.overheadAllowedPercent < 15 ? "text-critical" : "text-ink" },
    { label: "Paid on time", value: `${m.paidOnTimePercent}%`, tone: m.paidOnTimePercent < 85 ? "text-critical" : "text-ink" },
    { label: "Paid in full", value: `${m.paidInFullPercent}%`, tone: m.paidInFullPercent < 100 ? "text-critical" : "text-ink" },
    { label: "Typical grant", value: `${m.typicalGrantMonths} months`, tone: "text-ink" },
    { label: "Reporting", value: `${m.reportsPerYear}/yr · ~${m.reportingHoursPerYear} h`, tone: m.reportingHoursPerYear > 80 ? "text-critical" : "text-ink" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="bg-paper px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{i.label}</dt>
          <dd className={`mt-1 font-serif text-lg font-semibold ${i.tone}`}>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
