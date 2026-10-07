"use client";

import { useState } from "react";
import type { Funder } from "@/data/types";
import { formatUsd } from "@/lib/format";
import { DEFAULT_ASSUMPTIONS, grantBurden, type BurdenAssumptions } from "@/lib/funders";

function NumberField({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="mt-1 flex items-center rounded-md border border-rule-strong bg-paper px-3 focus-within:ring-2 focus-within:ring-accent">
        {prefix && <span className="text-ink-subtle">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full min-w-0 bg-transparent px-1 py-2 text-ink outline-none"
        />
        {suffix && <span className="text-sm text-ink-subtle">{suffix}</span>}
      </div>
    </div>
  );
}

export function BurdenCalculator({ funder }: { funder: Funder }) {
  const [grant, setGrant] = useState(50_000);
  const [a, setA] = useState<BurdenAssumptions>(DEFAULT_ASSUMPTIONS);
  const b = grantBurden(funder, grant, a);
  const rows = [
    {
      label: "Core costs the grant will not cover",
      value: formatUsd(b.coreShortfallUsd),
      note:
        b.coreShortfallUsd === 0
          ? `The funder allows ${funder.metrics.overheadAllowedPercent}%, at or above your ${a.ownCorePercent}%.`
          : `You need ${a.ownCorePercent}%; the funder allows ${funder.metrics.overheadAllowedPercent}% in a restricted budget. This gap comes from your other funding.`,
    },
    {
      label: "Staff time on reporting",
      value: `${b.reportingHours} hours · ${formatUsd(b.reportingCostUsd)}`,
      note: `${funder.metrics.reportsPerYear} reports a year over ${b.monthsOfSupport} months${
        funder.acceptsRegistryRecord ? "" : `, plus ${a.questionnaireHours} hours for its own due-diligence questionnaire`
      }.`,
    },
    {
      label: "Covering the wait",
      value: formatUsd(b.waitingCostUsd),
      note: `About ${b.daysUntilMoney} days from request to money (median decision plus payment), covered at ${a.bridgingPercentPerYear}% a year.`,
    },
    {
      label: "Late payments",
      value: formatUsd(b.lateCostUsd),
      note: `${b.latePaymentPercent}% of payments arrived late. Expected cost of covering a ${a.lateByDays}-day delay at ${a.bridgingPercentPerYear}% a year.`,
    },
    {
      label: "Money that may never arrive",
      value: formatUsd(b.unpaidUsd),
      note:
        b.unpaidUsd === 0
          ? "This funder has paid every promised amount in full."
          : `${100 - funder.metrics.paidInFullPercent}% of money this funder promised was never paid. Expected shortfall on this grant.`,
    },
  ];
  return (
    <div className="rounded-md border border-rule">
      <div className="grid gap-4 border-b border-rule bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField id="calc-grant" label="Grant offered" prefix="$" value={grant} onChange={setGrant} />
        <NumberField id="calc-core" label="Your real core costs" suffix="%" value={a.ownCorePercent} onChange={(n) => setA({ ...a, ownCorePercent: Math.min(100, n) })} />
        <NumberField id="calc-hour" label="Cost of one staff hour" prefix="$" value={a.staffHourUsd} onChange={(n) => setA({ ...a, staffHourUsd: n })} />
        <NumberField id="calc-q" label="Hours for a new questionnaire" value={a.questionnaireHours} onChange={(n) => setA({ ...a, questionnaireHours: n })} />
        <NumberField id="calc-rate" label="Cost of covering a wait" suffix="% a year" value={a.bridgingPercentPerYear} onChange={(n) => setA({ ...a, bridgingPercentPerYear: Math.min(200, n) })} />
        <NumberField id="calc-late" label="Typical delay when late" suffix="days" value={a.lateByDays} onChange={(n) => setA({ ...a, lateByDays: n })} />
      </div>
      <dl className="divide-y divide-rule">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm text-ink-muted">{r.label}</dt>
            <dd>
              <span className="font-semibold text-ink">{r.value}</span>
              <span className="mt-0.5 block text-xs text-ink-subtle">{r.note}</span>
            </dd>
          </div>
        ))}
      </dl>
      <div className="border-t-2 border-rule-strong p-4" aria-live="polite">
        <p className="text-sm text-ink-muted">Of {formatUsd(b.grantUsd)} offered, roughly</p>
        <p className="font-serif text-2xl font-semibold text-ink">
          {formatUsd(b.usableUsd)} reaches the work
          <span className="ml-2 text-base font-normal text-ink-muted">({b.burdenPercent}% lost to unpaid costs, paperwork, waiting and payment risk)</span>
        </p>
        <p className="mt-2 text-xs text-ink-subtle">
          A rough estimate from this funder&rsquo;s record and your own figures, which you can change. The cost of waiting
          counts credit, supplier terms or reserves used before the money arrives; set it to 0 if you would not start until
          paid. It is a starting point for your own judgement, not advice to accept or refuse.
        </p>
      </div>
    </div>
  );
}
