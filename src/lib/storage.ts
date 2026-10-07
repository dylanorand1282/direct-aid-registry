// Browser-only storage for simulated pledges. The app must work without it.
import { createLocalStore } from "./localStore";

export interface StoredPledge {
  id: string;
  projectSlug: string;
  amountUsd: number;
  designation: string; // "unrestricted", "whole-project" or a budget line name
  date: string; // ISO date
  simulated: true;
}

function isStoredPledge(value: unknown): value is StoredPledge {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.projectSlug === "string" &&
    typeof v.amountUsd === "number" &&
    typeof v.designation === "string" &&
    typeof v.date === "string" &&
    v.simulated === true
  );
}

const EMPTY: StoredPledge[] = [];

export const pledgeStore = createLocalStore<StoredPledge[]>(
  "dar.simulatedPledges.v1",
  (raw) => (Array.isArray(raw) ? raw.filter(isStoredPledge) : EMPTY),
  EMPTY,
);

export function readStoredPledges(): StoredPledge[] {
  return pledgeStore.get().value;
}

/** Returns false when the pledge could not be saved. */
export function saveStoredPledge(pledge: StoredPledge): boolean {
  return pledgeStore.set([...readStoredPledges(), pledge]);
}

export function clearStoredPledges(): void {
  pledgeStore.clear();
}
