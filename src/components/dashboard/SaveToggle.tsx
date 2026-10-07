"use client";

import { useLocalStore } from "@/lib/localStore";
import { savedStore, toggleSaved, type SavedKind } from "@/lib/saved";

/** Saves an organization or project to the demo donor dashboard, in this browser only. */
export function SaveToggle({ kind, slug }: { kind: SavedKind; slug: string }) {
  const snapshot = useLocalStore(savedStore);
  const saved = snapshot?.value[kind].includes(slug) ?? false;
  return (
    <button
      type="button"
      disabled={!snapshot}
      aria-pressed={saved}
      onClick={() => toggleSaved(kind, slug)}
      title="Saved in this browser for the demo donor dashboard"
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        saved ? "border-accent bg-accent-soft text-accent-strong" : "border-rule-strong bg-paper text-ink hover:border-accent hover:text-accent"
      }`}
    >
      <span aria-hidden="true">{saved ? "★" : "☆"}</span>
      {saved ? "Saved to dashboard" : "Save to dashboard"}
    </button>
  );
}
