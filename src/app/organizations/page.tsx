import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { OrgDirectory } from "@/components/org/OrgDirectory";
import { OrgDirectoryStatic } from "@/components/org/OrgDirectoryStatic";
import { getOrganizations } from "@/lib/queries";

export const metadata: Metadata = { title: "NGO Directory" };

export default function OrganizationsPage() {
  const organizations = getOrganizations();
  return (
    <>
      <PageHeader
        eyebrow="NGO Directory"
        title="Ukrainian humanitarian organizations"
        lead="Find organizations by where they work, what they do and the verification findings that matter for your grant. Organizations are listed by name, not ranked. Every organization listed is fictional."
      />
      <Section>
        {/* Filters live in the URL; the prerendered shell shows the unfiltered list until it hydrates. */}
        <Suspense fallback={<OrgDirectoryStatic organizations={organizations} />}>
          <OrgDirectory organizations={organizations} />
        </Suspense>
      </Section>
    </>
  );
}
