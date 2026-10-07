import { Container } from "@/components/layout/Container";
import { REFUGEES_INTERNATIONAL_2024 } from "@/data/sources";

const SOURCE_URL = REFUGEES_INTERNATIONAL_2024.url;

// Real-world context, sourced. Kept visually distinct from the fictional data elsewhere.
const FACTS = [
  {
    kind: "Measured",
    value: "0.07%",
    label: "of humanitarian funding for Ukraine went directly to Ukrainian civil society organizations, as of March 2024",
  },
  {
    kind: "Commitment, not yet met",
    value: "25%",
    label:
      "is the localization target in the Grand Bargain: signatories pledged to direct at least this share of humanitarian funding to local and national responders",
  },
  {
    kind: "Estimate",
    value: "15.5%",
    label: "more cost-efficient programming was estimated when local rather than international intermediaries deliver it",
  },
];

export function ProblemSection() {
  return (
    <section aria-labelledby="problem-heading" className="bg-paper">
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">The problem</p>
            <h2 id="problem-heading" className="mt-2 font-serif text-3xl font-semibold text-ink">
              Local organizations do much of the frontline work, but almost none of the funding reaches them
              directly.
            </h2>
            <p className="mt-4 text-ink-muted">
              Ukrainian NGOs evacuate civilians, run mobile clinics and repair homes in communities international
              agencies struggle to reach. Most of their funding arrives as sub-grants passed down through
              international intermediaries, each adding overhead, reporting requirements and delay.
            </p>
            <p className="mt-4 text-ink-muted">
              Donors who want to fund local organizations directly face a different problem: no common way to judge
              whether an organization is sound, what it needs, or what their money achieved.
            </p>
          </div>

          <div>
            <dl className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-3">
              {FACTS.map((fact) => (
                <div key={fact.value} className="bg-paper p-5">
                  <dt>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                      {fact.kind}
                    </span>
                    <span className="mt-1 block font-serif text-4xl font-semibold text-ink">{fact.value}</span>
                  </dt>
                  <dd className="mt-2 text-sm text-ink-muted">{fact.label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-ink-subtle">
              Real-world context, not prototype data. Source:{" "}
              <a href={SOURCE_URL} className="underline underline-offset-2 hover:text-accent" rel="noreferrer">
                Refugees International, &ldquo;Passing the Buck: The Economics of Localizing Aid in Ukraine&rdquo;
              </a>{" "}
              (July 2024), citing UN OCHA Financial Tracking Service data.
            </p>

            <FundingRoutes />
          </div>
        </div>
      </Container>
    </section>
  );
}

function FundingRoutes() {
  return (
    <figure className="mt-8 rounded-md border border-rule bg-surface p-5">
      <figcaption className="text-sm font-semibold text-ink">How money reaches a community</figcaption>
      <div className="mt-4 space-y-5 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">Typical route today</p>
          <Route steps={["Donor", "UN agency or INGO", "Intermediary", "Ukrainian NGO", "Community"]} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Route this platform supports</p>
          <Route steps={["Donor", "Ukrainian NGO", "Community"]} highlight />
          <p className="mt-2 text-xs text-ink-muted">
            Backed by standardized verification, published budgets and regular reporting.
          </p>
        </div>
      </div>
    </figure>
  );
}

function Route({ steps, highlight = false }: { steps: string[]; highlight?: boolean }) {
  return (
    <ol className="mt-2 flex flex-wrap items-center gap-y-2">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center">
          {i > 0 && (
            <span aria-hidden="true" className="px-2 text-ink-subtle">
              →
            </span>
          )}
          <span
            className={`rounded border px-2.5 py-1 ${
              highlight && step === "Ukrainian NGO"
                ? "border-accent bg-accent-soft font-medium text-accent-strong"
                : "border-rule-strong bg-paper text-ink"
            }`}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
