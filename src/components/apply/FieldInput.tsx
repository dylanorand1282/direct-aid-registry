"use client";

import Link from "next/link";
import {
  CANNOT_OBTAIN_REASONS,
  EVIDENCE_OPTIONS,
  SELF_ANSWER_OPTIONS,
  VISIBILITY_LABEL,
  type ApplicationField,
} from "@/data/application";
import { reasonKey, type DraftValue, type DraftValues } from "@/lib/application";
import { categoryLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/Badge";

const inputClass =
  "mt-2 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft";

type OnChange = (id: string, value: DraftValue) => void;

export function FieldMeta({ field }: { field: ApplicationField }) {
  return (
    <div className="mt-2 flex flex-col gap-2 text-xs text-ink-muted sm:flex-row sm:items-start sm:justify-between">
      <p className="max-w-xl">
        <span className="font-semibold text-ink">Why we ask: </span>
        {field.why}
      </p>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        <Badge tone={field.visibility === "published" ? "accent" : "neutral"}>{VISIBILITY_LABEL[field.visibility]}</Badge>
        {field.supports && field.kind !== "evidence" && (
          <Link href={`/methodology#${field.supports}`} className="hover:underline">
            <Badge tone="neutral">Supports: {categoryLabel[field.supports]}</Badge>
          </Link>
        )}
      </div>
    </div>
  );
}

function OptionPills({
  name,
  options,
  value,
  onSelect,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: DraftValue | undefined;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
            value === o.value ? "border-accent bg-accent-soft font-medium text-accent-strong" : "border-rule-strong bg-paper text-ink hover:border-accent"
          }`}
        >
          <input
            type="radio"
            className="sr-only"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onSelect(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export function FieldInput({ field, values, onChange }: { field: ApplicationField; values: DraftValues; onChange: OnChange }) {
  const value = values[field.id];
  const id = `f-${field.id}`;
  const label = (
    <>
      {field.label}
      {field.required && <span className="ml-1 text-xs font-normal text-ink-subtle">(required)</span>}
    </>
  );

  switch (field.kind) {
    case "ack":
      return (
        <div>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              id={id}
              className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
              checked={value === true}
              onChange={(e) => onChange(field.id, e.target.checked)}
            />
            <span className="font-medium">{label}</span>
          </label>
          <div className="pl-7">
            <FieldMeta field={field} />
          </div>
        </div>
      );
    case "text":
    case "number":
    case "textarea":
      return (
        <div>
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
          {field.hint && <p className="mt-0.5 text-xs text-ink-subtle">{field.hint}</p>}
          {field.kind === "textarea" ? (
            <textarea
              id={id}
              rows={4}
              className={inputClass}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(field.id, e.target.value)}
            />
          ) : (
            <input
              id={id}
              type={field.kind === "number" ? "number" : "text"}
              inputMode={field.kind === "number" ? "numeric" : undefined}
              min={field.kind === "number" ? 0 : undefined}
              className={`${inputClass} ${field.kind === "number" ? "max-w-40" : ""}`}
              value={value === undefined ? "" : String(value)}
              onChange={(e) => {
                if (field.kind !== "number") return onChange(field.id, e.target.value);
                const n = e.target.valueAsNumber;
                onChange(field.id, Number.isFinite(n) ? n : "");
              }}
            />
          )}
          <FieldMeta field={field} />
        </div>
      );
    case "select":
    case "answer": {
      const options = field.kind === "select" ? field.options : SELF_ANSWER_OPTIONS;
      return (
        <fieldset>
          <legend className="text-sm font-medium text-ink">{label}</legend>
          <OptionPills name={id} options={options} value={value} onSelect={(v) => onChange(field.id, v)} />
          <FieldMeta field={field} />
        </fieldset>
      );
    }
    case "multi": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <fieldset>
          <legend className="text-sm font-medium text-ink">{label}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {field.options.map((o) => {
              const on = selected.includes(o.value);
              return (
                <label
                  key={o.value}
                  className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                    on ? "border-accent bg-accent-soft font-medium text-accent-strong" : "border-rule-strong bg-paper text-ink hover:border-accent"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => onChange(field.id, on ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
          <FieldMeta field={field} />
        </fieldset>
      );
    }
    case "evidence": {
      const reason = values[reasonKey(field.id)];
      return (
        <fieldset className="border-t border-rule py-4 first:border-t-0">
          <legend className="sr-only">{field.label}</legend>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm font-medium text-ink">{field.label}</p>
            <OptionPills name={id} options={EVIDENCE_OPTIONS} value={value} onSelect={(v) => onChange(field.id, v)} />
          </div>
          {value === "cannot-obtain" && (
            <div className="mt-3 rounded-md border border-dashed border-rule-strong bg-surface p-3 text-sm">
              <label htmlFor={`${id}-reason`} className="font-medium text-ink">
                Why can it not be obtained?
              </label>
              <select
                id={`${id}-reason`}
                className={`${inputClass} max-w-sm`}
                value={typeof reason === "string" ? reason : ""}
                onChange={(e) => onChange(reasonKey(field.id), e.target.value)}
              >
                <option value="">Choose a reason</option>
                {CANNOT_OBTAIN_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-ink-muted">
                This is not held against you. If no other evidence is found, the item is recorded as{" "}
                <span className="font-medium text-ink">Unable to verify</span> with the reason published, never as Does
                not meet standard. Reviewers will suggest an{" "}
                <Link href="/methodology#unverifiable" className="text-accent underline-offset-2 hover:underline">
                  alternative evidence route
                </Link>
                , such as bank statements or references from two established partners.
              </p>
            </div>
          )}
        </fieldset>
      );
    }
  }
}
