import { Container } from "@/components/layout/Container";

const PRINCIPLES = [
  {
    title: "Evidence over reputation",
    body: "Statuses come from documented criteria applied the same way to every organization. They are evidence for funders' own decisions, not a judgement of who deserves funding.",
  },
  {
    title: "Partial is shown as partial",
    body: "An organization can meet some categories and not others. Each is shown separately, including those not yet assessed.",
  },
  {
    title: "Core costs are part of the budget",
    body: "Every project lists what the money pays for, including the organization's own running costs. Pledges are unrestricted by default; restricting them is a choice, not the expected one.",
  },
  {
    title: "Reporting is part of listing",
    body: "Organizations commit to milestone updates and outcome figures. Delays are published as updates, not left out.",
  },
];

export function TrustPrinciples() {
  return (
    <section aria-labelledby="principles-heading" className="bg-paper">
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Principles</p>
            <h2 id="principles-heading" className="mt-2 font-serif text-3xl font-semibold text-ink">
              What the registry publishes, and why.
            </h2>
            <p className="mt-4 text-ink-muted">
              The registry is shared infrastructure. It publishes evidence that Ukrainian organizations and funders both
              rely on, under a standard proposed to be governed by Ukrainian civil society.
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border-t border-rule pt-4">
                <dt className="font-semibold text-ink">{p.title}</dt>
                <dd className="mt-2 text-sm text-ink-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
