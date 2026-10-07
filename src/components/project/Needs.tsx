"use client";

import { EMPTY_PROJECT_FILTERS, parseProjectFilters, serializeProjectFilters, type NeedRow } from "@/lib/projectFilters";
import { useUrlState } from "@/components/filters/useUrlState";
import { NeedsView } from "./NeedsView";

export function Needs({ rows }: { rows: NeedRow[] }) {
  const { state, setState, isPending } = useUrlState(parseProjectFilters, serializeProjectFilters);
  return <NeedsView rows={rows} filters={state} onChange={setState} isPending={isPending} />;
}

/** Unfiltered list used as the prerender fallback before the URL is read. */
export function NeedsStatic({ rows }: { rows: NeedRow[] }) {
  return <NeedsView rows={rows} filters={EMPTY_PROJECT_FILTERS} onChange={() => {}} />;
}
