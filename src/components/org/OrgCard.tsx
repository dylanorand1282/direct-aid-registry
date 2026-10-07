import Link from "next/link";
import type { Organization } from "@/data/types";
import { publicGap, publicRegions } from "@/lib/disclosure";
import { sectorLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/Badge";
import { FictionalTag } from "@/components/ui/FictionalTag";
import { FindingsStrip } from "@/components/verification/FindingsStrip";

export function OrgCard({ org }: { org: Organization }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-rule bg-paper p-5">
      <div className="flex flex-wrap items-center gap-2">
        <FictionalTag isFictional={org.isFictional} />
      </div>
      <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink">
        <Link href={`/organizations/${org.slug}`} className="hover:text-accent">
          {org.name}
        </Link>
      </h3>
      <p className="text-xs text-ink-subtle" lang="uk">
        {org.nameUk}
      </p>
      <p className="mt-3 text-sm text-ink-muted">{org.summary}</p>
      <div className="mt-4 rounded border border-rule bg-surface px-3 py-2">
        <FindingsStrip org={org} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {org.sectors.map((sector) => (
          <Badge key={sector} tone="accent">
            {sectorLabel[sector]}
          </Badge>
        ))}
      </div>
      <div className="mt-auto pt-5">
        <dl className="grid grid-cols-2 gap-2 border-t border-rule pt-4 text-xs text-ink-subtle">
        <div>
          <dt>Operates in</dt>
          <dd className="text-sm text-ink">{publicRegions(org)}</dd>
        </div>
        <div>
          <dt>Open funding gap</dt>
          <dd className="text-sm text-ink">{publicGap(org)}</dd>
        </div>
        </dl>
      </div>
    </article>
  );
}
