import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Needs, NeedsStatic } from "@/components/project/Needs";
import { getCurrentNeeds } from "@/lib/queries";

export const metadata: Metadata = { title: "Current Needs" };

export default function NeedsPage() {
  const rows = getCurrentNeeds();
  return (
    <>
      <PageHeader
        eyebrow="Current Needs"
        title="Current projects"
        lead="Budgeted projects, grouped under the organizations that run them. Each shows what it pays for and what reporting to expect. Projects are not ranked by urgency, and unrestricted support to the organization stays the default. Every project is fictional."
      />
      <Section>
        <Suspense fallback={<NeedsStatic rows={rows} />}>
          <Needs rows={rows} />
        </Suspense>
      </Section>
    </>
  );
}
