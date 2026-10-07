import { TIER_MEANING, TIER_REQUIREMENTS, TIERS_FOLLOW_TRACK, VERIFICATION_CATEGORY_DEFINITIONS } from "@/data/methodology";
import { VERIFICATION_TIERS } from "@/data/schema";
import { tierName } from "@/lib/labels";

export function TierSection() {
  const tiers = [...VERIFICATION_TIERS].reverse();
  return (
    <div className="space-y-6">
      <p className="rounded-md border border-rule bg-surface p-4 text-sm text-ink-muted">
        <span className="font-semibold text-ink">Tiers are a summary for the methodology, not a ranking.</span> Donors see
        the finding in each category, and choose which categories matter for their grant. {TIERS_FOLLOW_TRACK}
      </p>
      <div className="overflow-x-auto rounded-md border border-rule">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Categories that must meet the standard for each tier, on the standard and full tracks</caption>
          <thead className="bg-surface text-xs text-ink-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium uppercase tracking-wider">Tier</th>
              {VERIFICATION_CATEGORY_DEFINITIONS.map((c) => (
                <th key={c.id} scope="col" className="px-2 py-3 text-center font-medium">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {tiers.map((tier) => (
              <tr key={tier}>
                <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                  {tierName[tier]}
                </th>
                {VERIFICATION_CATEGORY_DEFINITIONS.map((c) => {
                  const required = TIER_REQUIREMENTS[tier].includes(c.id);
                  return (
                    <td key={c.id} className="px-2 py-3 text-center">
                      {required ? (
                        <span className="text-good" aria-label="Required">
                          ●
                        </span>
                      ) : (
                        <span className="text-rule-strong" aria-label="Not required">
                          ○
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-subtle">● must be at Meets standard &nbsp; ○ not required for this tier. Standard and full tracks; on the light track, categories it does not review are never required.</p>

      <div className="space-y-4">
        {tiers.map((tier) => (
          <article id={tier} key={tier} className="scroll-mt-6 rounded-md border border-rule">
            <h3 className="border-b border-rule bg-surface px-5 py-3 font-serif text-lg font-semibold text-ink">
              {tierName[tier]}
            </h3>
            <div className="grid gap-px bg-rule md:grid-cols-2">
              <div className="bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-good">Tells you</p>
                <p className="mt-1 text-sm text-ink">{TIER_MEANING[tier].tellsYou}</p>
              </div>
              <div className="bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-critical">Does not tell you</p>
                <p className="mt-1 text-sm text-ink">{TIER_MEANING[tier].doesNotTellYou}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-md bg-surface p-5 text-sm text-ink-muted">
        <p className="font-semibold text-ink">A lower tier does not mean a worse organization.</p>
        <p className="mt-1">
          Tier 3 needs completed projects to assess, so newly founded organizations cannot reach it quickly. Small
          frontline groups may also lack the formal structures the standard looks for. Read each category and its
          reviewer note rather than relying on the tier alone.
        </p>
      </div>
    </div>
  );
}
