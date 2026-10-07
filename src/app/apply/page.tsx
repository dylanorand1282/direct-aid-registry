import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationForm } from "@/components/apply/ApplicationForm";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { APPLICATION_NOTICES } from "@/data/application";
import { STANDARD_VERSION } from "@/data/methodology";

export const metadata: Metadata = { title: "Apply for review" };

const PRINCIPLES = [
  {
    title: "Applying starts a review, nothing more",
    body: APPLICATION_NOTICES.noGuarantee,
  },
  {
    title: "Every question has a reason",
    body: "Each question shows why it is asked, which verification category it supports, and whether the answer is published or seen only by reviewers.",
  },
  {
    title: "Finish over several sittings",
    body: APPLICATION_NOTICES.storage,
  },
  {
    title: "Your record is yours",
    body: "After review you receive a signed record of the findings. You can share it with any funder, on or off this platform, and anyone can check it has not been altered.",
  },
  {
    title: "No documents here",
    body: "This prototype accepts no files. In a real review, documents would be shared with named reviewers through a secure channel, never uploaded to a public form.",
  },
];

export default function ApplyPage() {
  return (
    <>
      <PageHeader
        eyebrow="For Ukrainian organizations · prototype"
        title="Apply for review"
        lead="The intake side of due diligence. This form collects what reviewers need to assess your organization against the verification standard, and tells you exactly how each answer will be used."
      >
        <p className="text-sm text-ink-muted">
          Questions follow{" "}
          <Link href="/methodology" className="text-accent hover:underline">
            verification standard {STANDARD_VERSION}
          </Link>
          . Use made-up details only: this is a prototype, and nothing you enter leaves your browser.
        </p>
      </PageHeader>
      <Container className="py-10">
        <ul className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="bg-paper p-4">
              <p className="font-semibold text-ink">{p.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{p.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ApplicationForm />
        </div>
      </Container>
    </>
  );
}
