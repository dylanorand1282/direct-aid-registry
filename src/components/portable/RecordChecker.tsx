"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { RECORDS_AS_OF } from "@/data/verificationEvents";
import { formatDate } from "@/lib/format";
import { categoryLabel, categoryStatusLabel } from "@/lib/labels";
import { verifyRecord, type VerifyResult } from "@/lib/portable/proof";
import { assessCurrency, statusPath, type Currency, type CurrentStatus } from "@/lib/portable/status";
import type { CategoryStatus } from "@/data/types";
import { Button } from "@/components/ui/Button";

interface Option {
  slug: string;
  name: string;
}

export interface EarlierCopy {
  key: string;
  label: string;
  json: string;
}

interface Checked {
  result: VerifyResult;
  subject?: string;
  validUntil?: string;
  currency?: Currency;
}

type ParsedRecord = {
  credentialSubject?: { name?: string; categories?: { id: string; status: string }[] };
  validFrom?: string;
  validUntil?: string;
  credentialStatus?: { id?: string };
};

async function loadStatus(record: ParsedRecord): Promise<CurrentStatus | null> {
  const path = record.credentialStatus?.id ? statusPath(record.credentialStatus.id) : null;
  if (!path) return null;
  try {
    const res = await fetch(path);
    return res.ok ? ((await res.json()) as CurrentStatus) : null;
  } catch {
    return null;
  }
}

export function RecordCheckerWithParams({ options, earlier }: { options: Option[]; earlier: EarlierCopy[] }) {
  const initial = useSearchParams().get("record");
  return <RecordChecker options={options} earlier={earlier} initialSlug={options.some((o) => o.slug === initial) ? initial : null} />;
}

export function RecordChecker({
  options,
  earlier,
  initialSlug,
}: {
  options: Option[];
  earlier: EarlierCopy[];
  initialSlug: string | null;
}) {
  const [slug, setSlug] = useState(initialSlug ?? options[0].slug);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<Checked | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setChecked(null);
    setError(null);
    const copy = earlier.find((e) => e.key === slug);
    if (copy) return setText(copy.json);
    try {
      const res = await fetch(`/organizations/${slug}/record.json`);
      setText(await res.text());
    } catch {
      setError("The example record could not be loaded.");
    }
  };

  const check = async () => {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setChecked({ result: { ok: false, reason: "This is not valid JSON." } });
      return;
    }
    const r = parsed as ParsedRecord;
    const result = await verifyRecord(parsed);
    // Only an unaltered record is worth checking for currency.
    const currency = result.ok ? assessCurrency(r, await loadStatus(r)) : undefined;
    setChecked({ result, subject: r.credentialSubject?.name, validUntil: r.validUntil, currency });
  };

  // Demonstrates tamper detection: upgrade the first finding that is not yet met.
  const alter = () => {
    try {
      const record = JSON.parse(text);
      const category = record.credentialSubject.categories.find((c: { status: string }) => c.status !== "meets-standard");
      if (category) {
        category.status = "meets-standard";
        category.statusLabel = "Meets standard";
      } else {
        record.credentialSubject.tier.label = "Illustrative: Tier 3 (edited)";
      }
      setText(JSON.stringify(record, null, 2));
      setChecked(null);
    } catch {
      setError("Load a record first.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block text-sm text-ink-muted">
          Example record
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-ink sm:w-80"
          >
            <optgroup label="Current records">
              {options.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Older copies">
              {earlier.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <Button variant="secondary" onClick={load}>
          Load its structured record
        </Button>
      </div>

      <label className="block text-sm font-medium text-ink">
        Record (JSON)
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setChecked(null);
          }}
          rows={12}
          spellCheck={false}
          placeholder="Paste a record an organization has shared with you, or load an example above."
          className="mt-1 block w-full rounded-md border border-rule-strong bg-paper p-3 font-mono text-xs text-ink"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button onClick={check} disabled={!text.trim()}>
          Check record
        </Button>
        <Button variant="ghost" onClick={alter} disabled={!text.trim()}>
          Alter one finding, to see what happens
        </Button>
      </div>
      {error && <p className="text-sm text-critical">{error}</p>}

      {checked && <CheckResult checked={checked} />}
    </div>
  );
}

const VERDICT: Record<Currency["kind"], { title: string; tone: "good" | "partial" | "critical"; body: string }> = {
  current: {
    title: "Unaltered, in date, and matches the current status",
    tone: "good",
    body: "Every finding in this copy matches what the registry shows today.",
  },
  changed: {
    title: "Unaltered, but out of date",
    tone: "partial",
    body: "The copy is genuine, but findings have changed since it was signed. The changes are listed below. Ask the organization for its current record before relying on it.",
  },
  expired: {
    title: "Unaltered, but expired",
    tone: "critical",
    body: "The copy is genuine, but its validity has ended. Ask the organization for its current record.",
  },
  "not-yet-valid": {
    title: "Unaltered, but not yet valid",
    tone: "partial",
    body: "The copy is genuine, but its validity has not started. Check the dates with the organization.",
  },
  suspended: {
    title: "Unaltered, but suspended",
    tone: "critical",
    body: "The copy is genuine, but the registry has suspended this record since it was signed. Do not rely on it.",
  },
  unknown: {
    title: "Unaltered, but current status not confirmed",
    tone: "partial",
    body: "The copy is genuine and in date, but its current status could not be checked. Confirm it before relying on the record.",
  },
};

const BORDER = { good: "border-good", partial: "border-partial", critical: "border-critical" };
const TEXT = { good: "text-good", partial: "text-partial", critical: "text-critical" };

function CheckResult({ checked }: { checked: Checked }) {
  if (!checked.result.ok || !checked.currency) {
    return (
      <div role="status" className="rounded-md border-2 border-critical p-4 text-sm">
        <p className="font-semibold text-critical">Does not check out</p>
        <p className="mt-1 text-ink">{checked.result.ok ? "The record could not be assessed." : checked.result.reason}</p>
      </div>
    );
  }
  const verdict = VERDICT[checked.currency.kind];
  const c = checked.currency;
  return (
    <div role="status" className={`rounded-md border-2 p-4 text-sm ${BORDER[verdict.tone]}`}>
      <p className={`font-semibold ${TEXT[verdict.tone]}`}>{verdict.title}</p>
      <p className="mt-1 text-ink">
        {checked.subject} · fingerprint <span className="font-mono">{checked.result.fingerprint}</span>
        {checked.validUntil && ` · valid until ${formatDate(checked.validUntil.slice(0, 10))}`}
      </p>
      <p className="mt-2 text-ink">{verdict.body}</p>
      {c.kind === "changed" && (
        <ul className="mt-2 list-disc pl-5 text-ink">
          {c.changes.map((ch) => (
            <li key={ch.category}>
              {categoryLabel[ch.category]}: {categoryStatusLabel[ch.signed as CategoryStatus] ?? ch.signed} when signed, now{" "}
              {categoryStatusLabel[ch.now]}
            </li>
          ))}
        </ul>
      )}
      <ol className="mt-3 space-y-0.5 text-xs text-ink-muted">
        <li>1. Signature: matches the registry&rsquo;s key, so nothing was altered after signing.</li>
        <li>
          2. Dates: {c.kind === "expired" ? "expired" : c.kind === "not-yet-valid" ? "not yet valid" : "in date"} as of{" "}
          {formatDate(RECORDS_AS_OF)}, the prototype&rsquo;s records date.
        </li>
        <li>
          3. Current status:{" "}
          {c.kind === "expired" || c.kind === "not-yet-valid"
            ? "not compared, because the copy is not in date"
            : c.kind === "unknown"
              ? "could not be loaded"
              : c.kind === "changed"
                ? "differs from this copy"
                : c.kind === "suspended"
                  ? "suspended"
                  : "matches this copy"}
          .
        </li>
      </ol>
      <p className="mt-3 text-xs text-ink-subtle">
        None of this shows the findings are true. In this prototype the signing key is public, so the check demonstrates the
        mechanism only, and the status list is not itself signed.
      </p>
    </div>
  );
}
