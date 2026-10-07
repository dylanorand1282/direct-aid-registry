import Link from "next/link";
import { Container } from "@/components/layout/Container";

const STEPS = [
  {
    title: "Shared evidence, not a verdict",
    body: "Each organization is assessed against six published categories, from legal registration to safeguarding and reporting history. Every category has its own status, so gaps are visible. The standard is proposed to be governed by Ukrainian civil society, and statuses inform funders' decisions rather than make them.",
    href: "/methodology",
    cta: "Read the methodology",
  },
  {
    title: "Transparent discovery",
    body: "Donors find organizations by oblast, sector and the verification findings that matter for their grant. Organizations are listed, not ranked, and each one's projects show a line-item budget and milestones.",
    href: "/organizations",
    cta: "Browse the directory",
  },
  {
    title: "Direct funding and reporting",
    body: "Contributions go to the implementing organization, unrestricted by default so it can cover its own running costs. It posts updates donors can follow from their dashboard.",
    href: "/dashboard",
    cta: "See the donor dashboard",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="border-y border-rule bg-surface">
      <Container className="py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">How it works</p>
        <h2 id="how-heading" className="mt-2 max-w-2xl font-serif text-3xl font-semibold text-ink">
          One standard for trust, one place to find the work, one record of what it achieved.
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col rounded-md border border-rule bg-paper p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent font-serif text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{step.body}</p>
              <Link href={step.href} className="mt-auto pt-5 text-sm font-medium text-accent hover:text-accent-strong">
                {step.cta} →
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
