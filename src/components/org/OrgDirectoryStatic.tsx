"use client";

import { EMPTY_ORG_FILTERS } from "@/lib/filters";
import type { Organization } from "@/data/types";
import { OrgDirectoryView } from "./OrgDirectoryView";

/** Unfiltered directory used as the prerender fallback before the URL is read. */
export function OrgDirectoryStatic({ organizations }: { organizations: Organization[] }) {
  return <OrgDirectoryView organizations={organizations} filters={EMPTY_ORG_FILTERS} onChange={() => {}} />;
}
