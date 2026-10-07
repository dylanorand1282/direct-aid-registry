import { PROPORTIONALITY_FOR_FUNDERS, REVIEW_TRACKS, VERIFICATION_CATEGORY_DEFINITIONS, type ReviewTrack } from "@/data/methodology";
import { formatUsd } from "@/lib/format";

const TRACKS: ReviewTrack[] = ["light", "standard", "full"];

export function ProportionalitySection() {
  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-md border border-rule">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-2 font-medium">Track</th>
              <th className="px-4 py-2 font-medium">For</th>
              <th className="px-4 py-2 font-medium">Categories reviewed</th>
              <th className="px-4 py-2 font-medium">Typical time</th>
              <th className="px-4 py-2 font-medium">Proportionate for grants</th>
            </tr>
          </thead>
          <tbody>
            {TRACKS.map((id) => {
              const t = REVIEW_TRACKS[id];
              return (
                <tr key={id} className="border-t border-rule align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink">{t.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{t.whoFor}</td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    {t.categories.length === VERIFICATION_CATEGORY_DEFINITIONS.length
                      ? "All six"
                      : t.categories.map((c) => VERIFICATION_CATEGORY_DEFINITIONS.find((d) => d.id === c)!.name).join(", ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted">{t.typicalDuration}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink">
                    {t.proportionateGrantUpToUsd ? `Up to ${formatUsd(t.proportionateGrantUpToUsd)}` : "Any size"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(["light", "full"] as const).map((id) => (
          <div key={id} className="rounded-md border border-rule p-4">
            <p className="font-semibold text-ink">How the {REVIEW_TRACKS[id].name.toLowerCase()} differs</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
              {REVIEW_TRACKS[id].differences.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-md border-l-4 border-accent bg-surface p-4">
        <p className="font-semibold text-ink">For funders</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
          {PROPORTIONALITY_FOR_FUNDERS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
