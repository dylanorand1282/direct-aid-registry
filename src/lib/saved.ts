// Organizations and projects the demo donor follows. Seeded from the demo
// persona the first time, then kept in this browser.
import { demoDonor } from "@/data/donor";
import { createLocalStore } from "./localStore";

export interface SavedRecords {
  orgs: string[];
  projects: string[];
}

const SEED: SavedRecords = { orgs: demoDonor.savedOrgSlugs, projects: demoDonor.savedProjectSlugs };

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);

export const savedStore = createLocalStore<SavedRecords>(
  "dar.saved.v1",
  (raw) => {
    if (typeof raw !== "object" || raw === null) return SEED;
    const r = raw as Record<string, unknown>;
    return { orgs: strings(r.orgs), projects: strings(r.projects) };
  },
  SEED,
);

export type SavedKind = keyof SavedRecords;

export function toggleSaved(kind: SavedKind, slug: string): void {
  const current = savedStore.get().value;
  const list = current[kind];
  savedStore.set({ ...current, [kind]: list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug] });
}
