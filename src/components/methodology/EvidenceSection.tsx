import { CATEGORY_STATUSES } from "@/data/schema";
import { EVIDENCE_GRADES, STATUS_DEFINITIONS } from "@/data/methodology";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";

const RULES = [
  "Each criterion is judged on its own. A category meets the standard only when every one of its criteria does.",
  "Every criterion needs at least one piece of grade A, B or C evidence. Grade C counts only once matched to an A or B source.",
  "Self-declaration (grade D) is recorded but can never, on its own, support Meets standard.",
  "Evidence must be current: a registration extract no more than 3 months old, financial statements for the latest full year, and training within the last 12 months.",
  "Any unresolved red flag prevents Meets standard, however strong the other evidence is.",
  "Reviewers record which grades of evidence supported each decision, so a later reviewer or an appeal panel can follow the reasoning.",
];

export function EvidenceSection() {
  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-md border border-rule">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Evidence grades, strongest first</caption>
          <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Grade</th>
              <th scope="col" className="px-4 py-3 font-medium">What it is</th>
              <th scope="col" className="px-4 py-3 font-medium">Examples</th>
              <th scope="col" className="px-4 py-3 font-medium">Can support Meets standard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {EVIDENCE_GRADES.map((g) => (
              <tr key={g.grade} className="align-top">
                <th scope="row" className="px-4 py-3 font-normal">
                  <span className="font-serif text-lg font-semibold text-ink">{g.grade}</span>
                  <span className="ml-2 font-medium text-ink">{g.name}</span>
                </th>
                <td className="px-4 py-3 text-ink-muted">{g.description}</td>
                <td className="px-4 py-3 text-ink-muted">{g.examples}</td>
                <td className={`px-4 py-3 font-medium ${g.canSupportMeets ? "text-good" : "text-critical"}`}>
                  {g.canSupportMeets ? (g.grade === "C" ? "Yes, once corroborated" : "Yes") : "No, never on its own"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold text-ink">Decision rules</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="font-semibold text-ink">Category statuses</h3>
        <div className="mt-3 overflow-x-auto rounded-md border border-rule">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Meaning</th>
                <th scope="col" className="px-4 py-3 font-medium">Counts toward tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {[...CATEGORY_STATUSES].reverse().map((status) => (
                <tr key={status} className="align-top">
                  <td className="px-4 py-3">
                    <CategoryStatusChip status={status} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{STATUS_DEFINITIONS[status].meaning}</td>
                  <td className="px-4 py-3 text-ink">{STATUS_DEFINITIONS[status].countsTowardTier ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
