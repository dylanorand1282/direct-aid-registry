"use client";

import type { Organization } from "@/data/types";
import { parseOrgFilters, serializeOrgFilters } from "@/lib/filters";
import { useUrlState } from "@/components/filters/useUrlState";
import { OrgDirectoryView } from "./OrgDirectoryView";

export function OrgDirectory({ organizations }: { organizations: Organization[] }) {
  const { state, setState, isPending } = useUrlState(parseOrgFilters, serializeOrgFilters);
  return <OrgDirectoryView organizations={organizations} filters={state} onChange={setState} isPending={isPending} />;
}
