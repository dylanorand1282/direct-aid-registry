import Link from "next/link";
import type { Organization } from "@/data/types";
import { publicGap, publicRegions } from "@/lib/disclosure";
import { sectorLabel } from "@/lib/labels";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { FindingsStrip } from "@/components/verification/FindingsStrip";

export function OrgListTable({ organizations }: { organizations: Organization[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-rule">
      <table className="w-full min-w-[920px] text-left text-sm">
        <caption className="sr-only">Organizations matching the current filters (fictional)</caption>
        <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Organization</th>
            <th scope="col" className="px-4 py-3 font-medium">Operates in</th>
            <th scope="col" className="px-4 py-3 font-medium">Sectors</th>
            <th scope="col" className="px-4 py-3 font-medium">Findings by category</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Open gap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule bg-paper">
          {organizations.map((org) => (
            <tr key={org.slug} className="align-top">
              <th scope="row" className="px-4 py-3 font-normal">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/organizations/${org.slug}`} className="font-medium text-ink hover:text-accent">
                    {org.name}
                  </Link>
                  <FictionalTag isFictional={org.isFictional} />
                </div>
                <div className="mt-0.5 text-xs text-ink-subtle" lang="uk">
                  {org.nameUk}
                </div>
              </th>
              <td className="px-4 py-3 text-ink-muted">{publicRegions(org)}</td>
              <td className="px-4 py-3 text-ink-muted">{org.sectors.map((s) => sectorLabel[s]).join(", ")}</td>
              <td className="w-64 px-4 py-3">
                <FindingsStrip org={org} />
              </td>
              <td className="px-4 py-3 text-right text-ink">{publicGap(org)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
