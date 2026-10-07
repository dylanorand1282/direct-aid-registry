"use client";

import Link from "next/link";
import { DEMO_FUNDER_SLUG } from "@/data/funders";
import { useState } from "react";
import { RESTRICTION_OPTIONS, restrictionOf, UNRESTRICTED, WHOLE_PROJECT } from "@/data/fundingTerms";
import { PLEDGE_MIN_USD, PLEDGE_NOTICES, PLEDGE_PRESETS_USD, SIMULATED_PLEDGE_PREFIX } from "@/data/pledge";
import type { CategoryStatus, Project } from "@/data/types";
import { projectFunding } from "@/lib/disclosure";
import { formatDate, formatUsd } from "@/lib/format";
import { categoryStatusLabel } from "@/lib/labels";
import type { ReportingExpectation } from "@/lib/projectEvidence";
import { saveStoredPledge, type StoredPledge } from "@/lib/storage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";

const STEPS = ["Review", "Amount", "Reporting", "Confirm"] as const;

export interface PledgeOrgSummary {
  slug: string;
  name: string;
  /** One-line category findings, e.g. "4 of 6 categories meet the standard · 1 in review". */
  findings: string;
  breakdown: { status: CategoryStatus; count: number }[];
  /** Null when the organization does not publish its funding gap; never sent to the browser then. */
  fundingGapUsd: number | null;
  annualReportDue: string | null;
}

export function PledgeSimulator({
  project,
  org,
  schedule,
}: {
  project: Project;
  org: PledgeOrgSummary;
  schedule: ReportingExpectation[];
}) {
  // When the organization withholds its funding gap, only a band is public, so the
  // simulation is capped at the most the project could still need and no exact amount is shown.
  const funding = projectFunding(project);
  const stillNeeded = funding.maxStillNeededUsd;
  const presets = PLEDGE_PRESETS_USD.filter((amount) => amount <= stillNeeded);

  const [step, setStep] = useState(0);
  const [readMeaning, setReadMeaning] = useState(false);
  const [understoodSimulation, setUnderstoodSimulation] = useState(false);
  const [amount, setAmount] = useState<number>(presets.at(1) ?? presets.at(0) ?? stillNeeded);
  // Unrestricted is the default; restricting is a choice the donor makes, not the expected one.
  const [designation, setDesignation] = useState<string>(UNRESTRICTED);
  const [recorded, setRecorded] = useState<{ pledge: StoredPledge; saved: boolean } | null>(null);

  const restriction = restrictionOf(designation);
  const unrestricted = restriction === "unrestricted";
  // Unrestricted support is capped by the organization's whole funding gap, restricted support by this project's.
  const cap = unrestricted && org.fundingGapUsd !== null ? Math.max(org.fundingGapUsd, stillNeeded) : stillNeeded;
  const amountValid = Number.isInteger(amount) && amount >= Math.min(PLEDGE_MIN_USD, cap) && amount <= cap;
  const reportCount = unrestricted ? 1 : schedule.length;
  const firstReport = unrestricted ? org.annualReportDue : schedule[0]?.due;
  const canContinue = [readMeaning && understoodSimulation, amountValid, true, true][step];
  const designationLabel =
    restriction === "budget-line" ? `Restricted to “${designation}”` : RESTRICTION_OPTIONS[restriction].label;
  const lines = project.budget;

  const record = () => {
    const pledge: StoredPledge = {
      id: `${SIMULATED_PLEDGE_PREFIX}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      projectSlug: project.slug,
      amountUsd: amount,
      designation,
      date: new Date().toISOString().slice(0, 10),
      simulated: true,
    };
    setRecorded({ pledge, saved: saveStoredPledge(pledge) });
  };

  if (recorded) {
    return (
      <div className="rounded-md border-2 border-good p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-good">Simulation complete</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
          Simulated pledge {recorded.pledge.id} recorded
        </h2>
        <p className="mt-3 max-w-2xl text-ink">{PLEDGE_NOTICES.confirmation}</p>
        <dl className="mt-5 grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-3">
          {[
            ["Simulated amount", formatUsd(recorded.pledge.amountUsd)],
            ["Terms", designationLabel],
            ["First report expected", firstReport ? formatDate(firstReport) : "After initial assessment"],
          ].map(([label, value]) => (
            <div key={label} className="bg-paper p-4">
              <dt className="text-xs uppercase tracking-wider text-ink-subtle">{label}</dt>
              <dd className="mt-1 font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ink-muted">
          {recorded.saved
            ? PLEDGE_NOTICES.storage
            : "This browser blocked local storage, so the simulated pledge was not kept and will not appear on the dashboard."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard">View on donor dashboard</ButtonLink>
          <ButtonLink href={`/needs/${project.slug}#reporting`} variant="secondary">
            Back to the project
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-rule">
      <ol className="grid grid-cols-4 border-b border-rule text-sm" aria-label="Pledge steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`flex items-center gap-2 px-3 py-3 sm:px-5 ${i === step ? "bg-accent-soft font-medium text-accent-strong" : i < step ? "text-ink" : "text-ink-subtle"}`}
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${i <= step ? "bg-accent text-white" : "border border-rule-strong"}`}>
              {i < step ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </li>
        ))}
      </ol>

      <div className="space-y-6 p-5 sm:p-6">
        {step === 0 && (
          <>
            <h2 className="font-serif text-xl font-semibold text-ink">Review what you are relying on</h2>
            <div className="rounded-md border border-rule p-4 text-sm">
              <p className="text-ink">
                <Link href={`/organizations/${org.slug}`} className="font-medium hover:text-accent">
                  {org.name}
                </Link>{" "}
                · <span className="text-ink-muted">{org.findings}</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {org.breakdown.map((b) => (
                  <li key={b.status} className="flex items-center gap-1.5">
                    <CategoryStatusChip status={b.status} />
                    <span className="text-ink-muted">× {b.count}</span>
                  </li>
                ))}
              </ul>
              {org.breakdown.some((b) => b.status === "unable-to-verify") && (
                <p className="mt-3 text-ink-muted">
                  “{categoryStatusLabel["unable-to-verify"]}” means a check could not be done, often for security
                  reasons. It is not a finding against the organization.
                </p>
              )}
              <p className="mt-3 text-ink-muted">
                {funding.exact
                  ? `${formatUsd(stillNeeded)} still needed of ${formatUsd(project.targetUsd)}.`
                  : `${funding.label} of ${formatUsd(project.targetUsd)}. Exact amounts are withheld by the organization.`}{" "}
                Deadline {formatDate(project.deadline)}.
              </p>
            </div>
            <fieldset className="space-y-3">
              <legend className="sr-only">Acknowledgements</legend>
              <Check checked={readMeaning} onChange={setReadMeaning}>
                I understand that a verification status is not an endorsement, an audit, or a guarantee against fraud
                or of outcomes.{" "}
                <Link href="/methodology#meaning" target="_blank" className="text-accent underline underline-offset-2">
                  Read what a status means
                </Link>
              </Check>
              <Check checked={understoodSimulation} onChange={setUnderstoodSimulation}>
                {PLEDGE_NOTICES.acknowledgement}
              </Check>
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-serif text-xl font-semibold text-ink">Choose terms and a simulated amount</h2>
            <fieldset>
              <legend className="text-sm font-semibold text-ink">How may {org.name} use it?</legend>
              <div className="mt-3 space-y-2">
                {(["unrestricted", "project", "budget-line"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer gap-3 rounded-md border px-3 py-3 text-sm ${restriction === r ? "border-accent bg-accent-soft" : "border-rule hover:bg-surface"}`}
                  >
                    <input
                      type="radio"
                      name="restriction"
                      checked={restriction === r}
                      onChange={() => setDesignation(r === "unrestricted" ? UNRESTRICTED : r === "project" ? WHOLE_PROJECT : lines[0].line)}
                      className="mt-0.5 accent-accent"
                    />
                    <span>
                      <span className="font-medium text-ink">
                        {RESTRICTION_OPTIONS[r].label}
                        {r === "unrestricted" && <span className="ml-2 text-xs font-normal text-ink-subtle">Default</span>}
                      </span>
                      <span className="mt-0.5 block text-ink-muted">{RESTRICTION_OPTIONS[r].body}</span>
                    </span>
                  </label>
                ))}
              </div>
              {restriction === "budget-line" && (
                <label className="mt-3 block text-sm text-ink-muted">
                  Budget line
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="mt-1 block w-full max-w-md rounded-md border border-rule-strong bg-paper px-3 py-2 text-ink"
                  >
                    {lines.map((l) => (
                      <option key={l.line} value={l.line}>
                        {l.line} ({formatUsd(l.amountUsd)})
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </fieldset>
            <div>
              <p className="text-sm font-semibold text-ink">Simulated amount</p>
              <p className="mt-1 text-sm text-ink-muted">
                {unrestricted && org.fundingGapUsd === null
                  ? `Up to ${formatUsd(cap)} in this simulation. The organization does not publish its funding gap.`
                  : unrestricted
                  ? `Up to ${formatUsd(cap)}, the organization's total funding gap.`
                  : funding.exact
                  ? `Up to ${formatUsd(stillNeeded)}, the amount this project still needs.`
                  : `Up to ${formatUsd(stillNeeded)} in this simulation. The organization does not publish exact amounts still needed.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.filter((p) => p <= cap).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={amount === p}
                    onClick={() => setAmount(p)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${amount === p ? "border-accent bg-accent-soft text-accent-strong" : "border-rule-strong text-ink hover:border-accent"}`}
                  >
                    {formatUsd(p)}
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={amount === stillNeeded}
                  onClick={() => setAmount(stillNeeded)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium ${amount === stillNeeded ? "border-accent bg-accent-soft text-accent-strong" : "border-rule-strong text-ink hover:border-accent"}`}
                >
                  {!funding.exact ? "Simulation maximum" : unrestricted ? "This project's remaining" : "Full remaining"} {formatUsd(stillNeeded)}
                </button>
              </div>
              <label className="mt-4 block text-sm text-ink-muted">
                Or enter an amount in US dollars
                <input
                  type="number"
                  inputMode="numeric"
                  min={PLEDGE_MIN_USD}
                  max={cap}
                  step={100}
                  value={Number.isFinite(amount) ? amount : ""}
                  onChange={(e) => setAmount(Math.round(Number(e.target.value)))}
                  aria-invalid={!amountValid}
                  className="mt-1 block w-48 rounded-md border border-rule-strong px-3 py-2 text-ink"
                />
              </label>
              {!amountValid && (
                <p className="mt-2 text-sm text-critical">
                  Enter a whole amount between {formatUsd(Math.min(PLEDGE_MIN_USD, cap))} and {formatUsd(cap)}.
                </p>
              )}
              {amountValid && unrestricted && (
                <p className="mt-3 text-sm text-ink-muted">
                  The organization may put {formatUsd(amount)} towards this project or wherever it is most needed.
                </p>
              )}
              {amountValid && !unrestricted && (
                <p className="mt-3 text-sm text-ink-muted">
                  {funding.exact
                    ? `${formatUsd(amount)} would cover ${Math.round((amount / stillNeeded) * 100)}% of what is still needed and ${Math.round((amount / project.targetUsd) * 100)}% of the total budget.`
                    : `${formatUsd(amount)} would be ${Math.round((amount / project.targetUsd) * 100)}% of the total budget.`}
                </p>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-serif text-xl font-semibold text-ink">What you would hear back, and when</h2>
            <p className="text-sm text-ink-muted">
              Listed organizations commit to these reports. Missed or inaccurate reports count against their Reporting
              track record at the next review.
            </p>
            {unrestricted ? (
              <>
                <ol className="divide-y divide-rule rounded-md border border-rule">
                  <li className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <span className="text-ink">Annual report and accounts for the whole organization</span>
                    <span className="whitespace-nowrap text-ink-subtle">
                      {org.annualReportDue ? `by ${formatDate(org.annualReportDue)}` : "after initial assessment"}
                    </span>
                  </li>
                </ol>
                <p className="text-sm text-ink-muted">
                  Unrestricted support is reported once a year rather than per project, so the organization is not
                  writing a separate report for each funder. This project&rsquo;s updates stay visible to you either way.
                </p>
              </>
            ) : (
            <ol className="divide-y divide-rule rounded-md border border-rule">
              {schedule.map((item) => (
                <li key={item.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <span className="text-ink">{item.label}</span>
                  <span className="whitespace-nowrap text-ink-subtle">by {formatDate(item.due)}</span>
                </li>
              ))}
            </ol>
            )}
            {restriction === "budget-line" && (
              <p className="text-sm text-ink-muted">
                Spending reports would show “{designation}” separately, because your simulated pledge is designated to it.
              </p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-serif text-xl font-semibold text-ink">Confirm the simulated pledge</h2>
            <dl className="divide-y divide-rule rounded-md border border-rule text-sm">
              {[
                ["Project", project.title],
                ["Organization", `${org.name} · ${org.findings}`],
                ["Simulated amount", formatUsd(amount)],
                ["Terms", designationLabel],
                ["Reports expected", firstReport ? `${reportCount}, the first by ${formatDate(firstReport)}` : `${reportCount}, after initial assessment`],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr]">
                  <dt className="text-ink-subtle">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-ink-muted">
              Organizations see your{" "}
              <Link href={`/funders/${DEMO_FUNDER_SLUG}`} className="text-accent hover:underline">
                funder record
              </Link>{" "}
              too: how quickly you decide and pay, how much you give unrestricted, and what partners say about working with you.
            </p>
            <p className="rounded-md border border-notice-rule bg-notice p-3 text-sm text-ink">{PLEDGE_NOTICES.banner}</p>
          </>
        )}

        <div className="flex flex-wrap justify-between gap-3 border-t border-rule pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            ← Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              Continue
            </Button>
          ) : (
            <Button onClick={record}>Record simulated pledge</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-md border border-rule p-3 text-sm text-ink hover:bg-surface">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
      <span>{children}</span>
    </label>
  );
}
