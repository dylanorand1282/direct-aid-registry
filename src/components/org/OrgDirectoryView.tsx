"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FUNDING_NEEDS, OBLASTS, SECTORS, VERIFICATION_CATEGORIES } from "@/data/schema";
import type { Organization } from "@/data/types";
import {
  EMPTY_ORG_FILTERS,
  activeFilterCount,
  facetCount,
  filterOrganizations,
  type OrgFacet,
  type OrgFilters,
  type OrgSort,
} from "@/lib/filters";
import { categoryLabel, fundingNeedLabel, oblastLabel, sectorLabel } from "@/lib/labels";
import { FindingsKey } from "@/components/verification/FindingsStrip";
import { FilterChip } from "@/components/filters/FilterChip";
import { FilterGroup } from "@/components/filters/FilterGroup";
import { OrgCard } from "@/components/org/OrgCard";
import { OrgListTable } from "@/components/org/OrgListTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const SORT_LABELS: Record<OrgSort, string> = {
  name: "Name, A to Z",
  reviewed: "Most recently reviewed",
};

const FACET_LABELS: Record<OrgFacet, Record<string, string>> = {
  region: oblastLabel,
  sector: sectorLabel,
  meets: categoryLabel,
  need: fundingNeedLabel,
};

const SEARCH_DEBOUNCE_MS = 200;

export function OrgDirectoryView({
  organizations,
  filters,
  onChange,
  isPending = false,
}: {
  organizations: Organization[];
  filters: OrgFilters;
  onChange: (next: OrgFilters, mode?: "push" | "replace") => void;
  isPending?: boolean;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Bumped to remount the search box when the query is cleared from outside it.
  const [searchKey, setSearchKey] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(debounce.current), []);

  const results = filterOrganizations(organizations, filters);
  const activeCount = activeFilterCount(filters);

  const toggle = (facet: OrgFacet, value: string) => {
    const current = filters[facet] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [facet]: next });
  };

  const onSearch = (q: string) => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => onChange({ ...filters, q: q.trim() }, "replace"), SEARCH_DEBOUNCE_MS);
  };

  const clearAll = () => {
    clearTimeout(debounce.current);
    setSearchKey((k) => k + 1);
    onChange({ ...EMPTY_ORG_FILTERS, sort: filters.sort, view: filters.view });
  };

  const clearSearch = () => {
    setSearchKey((k) => k + 1);
    onChange({ ...filters, q: "" });
  };

  const options = (facet: OrgFacet, values: readonly string[]) =>
    values.map((value) => ({
      value,
      label: FACET_LABELS[facet][value],
      count: facetCount(organizations, filters, facet, value),
    }));

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <div>
        <Button
          variant="secondary"
          className="w-full lg:hidden"
          aria-expanded={filtersOpen}
          aria-controls="directory-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
          {activeCount > 0 && ` (${activeCount} active)`}
        </Button>

        <form
          id="directory-filters"
          role="search"
          aria-label="Filter organizations"
          onSubmit={(e) => e.preventDefault()}
          className={`${filtersOpen ? "mt-4 block" : "hidden"} space-y-5 lg:mt-0 lg:block`}
        >
          <div>
            <label htmlFor="directory-search" className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Search
            </label>
            <input
              key={searchKey}
              id="directory-search"
              type="search"
              defaultValue={filters.q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Name, mission or program"
              className="mt-2 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm placeholder:text-ink-subtle focus:border-accent"
            />
          </div>
          <FilterGroup
            legend="Region (oblast)"
            name="region"
            options={options("region", OBLASTS)}
            selected={filters.region}
            onToggle={(v) => toggle("region", v)}
            note="Where the organization operates. Organizations that withhold their locations for security are not matched."
          />
          <FilterGroup
            legend="Humanitarian sector"
            name="sector"
            options={options("sector", SECTORS)}
            selected={filters.sector}
            onToggle={(v) => toggle("sector", v)}
          />
          <FilterGroup
            legend="Meets the standard in"
            name="meets"
            options={options("meets", VERIFICATION_CATEGORIES)}
            selected={filters.meets}
            onToggle={(v) => toggle("meets", v)}
            note="Pick the categories that matter for your grant. Organizations must meet every one picked. Illustrative findings for fictional organizations."
          />
          <FilterGroup
            legend="Funding need"
            name="need"
            options={options("need", FUNDING_NEEDS)}
            selected={filters.need}
            onToggle={(v) => toggle("need", v)}
          />
          <p className="border-t border-rule pt-4 text-xs text-ink-subtle">
            Findings are explained in the{" "}
            <Link href="/methodology" className="underline underline-offset-2 hover:text-accent">
              verification methodology
            </Link>
            .
          </p>
        </form>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
          <p className="text-sm text-ink-muted" aria-live="polite">
            Showing <span className="font-semibold text-ink">{results.length}</span> of {organizations.length}{" "}
            fictional organizations
            {isPending && <span className="ml-2 text-ink-subtle">Updating…</span>}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              Sort
              <select
                value={filters.sort}
                onChange={(e) => onChange({ ...filters, sort: e.target.value as OrgSort })}
                className="rounded-md border border-rule-strong bg-paper px-2 py-1.5 text-sm text-ink"
              >
                {(Object.keys(SORT_LABELS) as OrgSort[]).map((sort) => (
                  <option key={sort} value={sort}>
                    {SORT_LABELS[sort]}
                  </option>
                ))}
              </select>
            </label>
            <div role="group" aria-label="Layout" className="flex rounded-md border border-rule-strong p-0.5">
              {(["grid", "list"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  aria-pressed={filters.view === view}
                  onClick={() => onChange({ ...filters, view })}
                  className={`rounded px-3 py-1 text-sm ${
                    filters.view === view ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {view === "grid" ? "Cards" : "Table"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeCount > 0 && (
          <ul aria-label="Active filters" className="mt-4 flex flex-wrap items-center gap-2">
            {filters.q && (
              <li>
                <FilterChip label={`Search: “${filters.q}”`} onRemove={clearSearch} />
              </li>
            )}
            {(["region", "sector", "meets", "need"] as const).flatMap((facet) =>
              (filters[facet] as string[]).map((value) => (
                <li key={`${facet}-${value}`}>
                  <FilterChip label={facet === "meets" ? `Meets: ${FACET_LABELS[facet][value]}` : FACET_LABELS[facet][value]} onRemove={() => toggle(facet, value)} />
                </li>
              )),
            )}
            <li>
              <button type="button" onClick={clearAll} className="px-2 text-sm font-medium text-accent hover:underline">
                Clear all
              </button>
            </li>
          </ul>
        )}

        <div className="mt-4">
          <FindingsKey />
        </div>

        <div className="mt-4">
          {results.length === 0 ? (
            <EmptyState title="No organizations match these filters.">
              <p>Try removing a filter or broadening your search.</p>
              <div className="mt-4">
                <Button variant="secondary" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            </EmptyState>
          ) : filters.view === "list" ? (
            <OrgListTable organizations={results} />
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((org) => (
                <li key={org.slug}>
                  <OrgCard org={org} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
