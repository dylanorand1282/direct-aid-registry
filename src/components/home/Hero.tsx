import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatUsd } from "@/lib/format";
import { getRegistrySummary } from "@/lib/queries";

export function Hero() {
  const summary = getRegistrySummary();
  const stats = [
    { label: "Organizations listed", value: String(summary.organizationCount) },
    { label: "Open projects", value: String(summary.openProjectCount) },
    { label: "Open funding gap", value: formatUsd(summary.openFundingGapUsd) },
    { label: "Oblasts covered", value: String(summary.oblastCount) },
  ];

  return (
    <section className="border-b border-rule bg-surface">
      <Container className="grid gap-10 py-14 lg:grid-cols-[3fr_2fr] lg:items-center lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Humanitarian funding registry · prototype
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Fund Ukrainian humanitarian organizations directly, with the evidence in front of you.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-muted">
            A shared record of evidence about local NGOs: what has been checked, what they need, and what they
            reported. Organizations and funders use it to make their own decisions, so frontline work can be funded
            without routing money through layers of intermediaries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/organizations">Browse organizations</ButtonLink>
            <ButtonLink href="/needs" variant="secondary">
              See current needs
            </ButtonLink>
          </div>
        </div>

        <aside aria-labelledby="snapshot-heading" className="rounded-md border border-rule bg-paper p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="snapshot-heading" className="text-sm font-semibold text-ink">
              Registry snapshot
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-partial">Fictional data</span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-accent pl-3">
                <dt className="text-xs text-ink-subtle">{stat.label}</dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-rule pt-4 text-xs text-ink-subtle">
            Placeholder figures for the prototype. No organization listed here exists.
          </p>
        </aside>
      </Container>
    </section>
  );
}
