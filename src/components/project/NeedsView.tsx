"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OBLASTS, SECTORS, VERIFICATION_CATEGORIES } from "@/data/schema";
import type { Organization } from "@/data/types";
import { formatUsd } from "@/lib/format";
import { categoryLabel, oblastLabel, sectorLabel } from "@/lib/labels";
import { findingsSummary } from "@/lib/verification";
import { FindingsStrip } from "@/components/verification/FindingsStrip";
import {
  AVAILABILITY,
  EMPTY_PROJECT_FILTERS,
  activeNeedFilterCount,
  filterNeeds,
  needFacetCount,
  type NeedRow,
  type ProjectFacet,
  type ProjectFilters,
  type ProjectSort,
} from "@/lib/projectFilters";
import { FilterChip } from "@/components/filters/FilterChip";
import { FilterGroup } from "@/components/filters/FilterGroup";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const SORT_LABELS: Record<ProjectSort, string> = {
  organization: "Grouped by organization",
  deadline: "Deadline, soonest first",
  remaining: "Largest amount still needed",
  progress: "Least funded first",
};

const FACET_LABELS: Record<ProjectFacet, Record<string, string>> = {
  region: oblastLabel,
  sector: sectorLabel,
  meets: categoryLabel,
  availability: { open: "Open for pledges", funded: "Fully funded" },
};

const SEARCH_DEBOUNCE_MS = 200;

export function NeedsView({
  rows,
  filters,
  onChange,
  isPending = false,
}: {
  rows: NeedRow[];
  filters: ProjectFilters;
  onChange: (next: ProjectFilters, mode?: "push" | "replace") => void;
  isPending?: boolean;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(debounce.current), []);

  const results = filterNeeds(rows, filters);
  const activeCount = activeNeedFilterCount(filters);
  const openResults = results.filter((r) => r.project.status === "open");
  const exactOpen = openResults.filter((r) => r.project.raisedUsd !== null);
  const withheldCount = openResults.length - exactOpen.length;
  const stillNeeded = exactOpen.reduce((sum, r) => sum + r.project.targetUsd - (r.project.raisedUsd ?? 0), 0);

  const toggle = (facet: ProjectFacet, value: string) => {
    const current = filters[facet] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [facet]: next });
  };
  const options = (facet: ProjectFacet, values: readonly string[]) =>
    values.map((value) => ({ value, label: FACET_LABELS[facet][value], count: needFacetCount(rows, filters, facet, value) }));
  const clearAll = () => {
    clearTimeout(debounce.current);
    setSearchKey((k) => k + 1);
    onChange({ ...EMPTY_PROJECT_FILTERS, sort: filters.sort });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <div>
        <Button
          variant="secondary"
          className="w-full lg:hidden"
          aria-expanded={filtersOpen}
          aria-controls="needs-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
          {activeCount > 0 && ` (${activeCount} active)`}
        </Button>
        <form
          id="needs-filters"
          role="search"
          aria-label="Filter projects"
          onSubmit={(e) => e.preventDefault()}
          className={`${filtersOpen ? "mt-4 block" : "hidden"} space-y-5 lg:mt-0 lg:block`}
        >
          <div>
            <label htmlFor="needs-search" className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Search
            </label>
            <input
              key={searchKey}
              id="needs-search"
              type="search"
              defaultValue={filters.q}
              onChange={(e) => {
                const q = e.target.value.trim();
                clearTimeout(debounce.current);
                debounce.current = setTimeout(() => onChange({ ...filters, q }, "replace"), SEARCH_DEBOUNCE_MS);
              }}
              placeholder="Project or organization"
              className="mt-2 w-full rounded-md border border-rule-strong bg-paper px-3 py-2 text-sm placeholder:text-ink-subtle focus:border-accent"
            />
          </div>
          <FilterGroup legend="Availability" name="availability" options={options("availability", AVAILABILITY)} selected={filters.availability} onToggle={(v) => toggle("availability", v)} />
          <FilterGroup legend="Region (oblast)" name="region" options={options("region", OBLASTS)} selected={filters.region} onToggle={(v) => toggle("region", v)} note="Where the project takes place. Projects whose organization withholds its locations are not matched." />
          <FilterGroup legend="Humanitarian sector" name="sector" options={options("sector", SECTORS)} selected={filters.sector} onToggle={(v) => toggle("sector", v)} />
          <FilterGroup legend="Organization meets the standard in" name="meets" options={options("meets", VERIFICATION_CATEGORIES)} selected={filters.meets} onToggle={(v) => toggle("meets", v)} note="Pick the categories that matter for your grant. Illustrative findings for fictional organizations." />
          <p className="border-t border-rule pt-4 text-xs text-ink-subtle">
            Findings are defined in the{" "}
            <Link href="/methodology#categories" className="underline underline-offset-2 hover:text-accent">
              verification methodology
            </Link>
            .
          </p>
        </form>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
          <p className="text-sm text-ink-muted" aria-live="polite">
            Showing <span className="font-semibold text-ink">{results.length}</span> of {rows.length} fictional
            projects
            {openResults.length > 0 && (
              <>
                {" "}
                · {formatUsd(stillNeeded)} still needed across open projects (illustrative)
                {withheldCount > 0 && `, not counting ${withheldCount} whose organization withholds its amounts`}
              </>
            )}
            {isPending && <span className="ml-2 text-ink-subtle">Updating…</span>}
          </p>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            Sort
            <select
              value={filters.sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value as ProjectSort })}
              className="rounded-md border border-rule-strong bg-paper px-2 py-1.5 text-sm text-ink"
            >
              {(Object.keys(SORT_LABELS) as ProjectSort[]).map((sort) => (
                <option key={sort} value={sort}>
                  {SORT_LABELS[sort]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeCount > 0 && (
          <ul aria-label="Active filters" className="mt-4 flex flex-wrap items-center gap-2">
            {filters.q && (
              <li>
                <FilterChip
                  label={`Search: “${filters.q}”`}
                  onRemove={() => {
                    setSearchKey((k) => k + 1);
                    onChange({ ...filters, q: "" });
                  }}
                />
              </li>
            )}
            {(["availability", "region", "sector", "meets"] as const).flatMap((facet) =>
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

        <div className="mt-6">
          {results.length === 0 ? (
            <EmptyState title="No projects match these filters.">
              <p>Try removing a filter or broadening your search.</p>
              <div className="mt-4">
                <Button variant="secondary" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            </EmptyState>
          ) : filters.sort === "organization" ? (
            <div className="space-y-10">
              {groupByOrg(results).map(({ org, projects }) => (
                <section key={org.slug} aria-labelledby={`group-${org.slug}`}>
                  <div className="rounded-md border border-rule bg-surface p-4">
                    <h2 id={`group-${org.slug}`} className="font-serif text-xl font-semibold text-ink">
                      <Link href={`/organizations/${org.slug}`} className="hover:text-accent">
                        {org.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">{org.summary}</p>
                    <div className="mt-3">
                      <FindingsStrip org={org} layout="inline" />
                    </div>
                    <p className="mt-2 text-xs text-ink-subtle">
                      {findingsSummary(org)}. Unrestricted support to the organization is the default when you pledge.
                    </p>
                  </div>
                  <ul className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => (
                      <li key={project.slug}>
                        <ProjectCard project={project} showOrg={false} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map(({ project }) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function groupByOrg(rows: NeedRow[]): { org: Organization; projects: NeedRow["project"][] }[] {
  const groups: { org: Organization; projects: NeedRow["project"][] }[] = [];
  for (const { org, project } of rows) {
    const last = groups.at(-1);
    if (last?.org.slug === org.slug) last.projects.push(project);
    else groups.push({ org, projects: [project] });
  }
  return groups;
}
