import type { ReactNode } from "react";

// Inline notice required on profile, project and pledge pages.
export function Disclaimer({ title = "Fictional placeholder", children }: { title?: string; children: ReactNode }) {
  return (
    <aside role="note" className="rounded-md border border-notice-rule bg-notice p-4 text-sm text-ink">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-ink-muted">{children}</div>
    </aside>
  );
}
