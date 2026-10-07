import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { FactList, RecordSection } from "@/components/layout/RecordSection";
import { PrintButton } from "@/components/portable/PrintButton";
import { ButtonLink } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { CategoryStatusChip } from "@/components/verification/CategoryStatusChip";
import { formatDate } from "@/lib/format";
import { MAPPING_STATUS, publicKeyMultibase } from "@/lib/portable/record";
import { cachedRecord } from "@/lib/portable/cached";
import { getOrganization, getOrganizations } from "@/lib/queries";

export function generateStaticParams() {
  return getOrganizations().map(({ slug }) => ({ slug }));
}

export const metadata: Metadata = { title: "Portable due-diligence record" };

export default async function PortableRecordPage({ params }: PageProps<"/organizations/[slug]/record">) {
  const org = getOrganization((await params).slug);
  if (!org) notFound();
  const { record, fingerprint } = (await cachedRecord(org.slug))!;
  const s = record.credentialSubject;
  const date = (iso?: string | null) => (iso ? formatDate(iso.slice(0, 10)) : "Not set");

  return (
    <Container className="max-w-4xl py-10">
      <div className="print:hidden">
        <Breadcrumbs
          items={[
            { href: "/organizations", label: "Organizations" },
            { href: `/organizations/${org.slug}`, label: org.name },
            { label: "Portable record" },
          ]}
        />
      </div>

      <header className="mt-6 border-b-2 border-ink pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Portable due-diligence record</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">{s.name}</h1>
        <p className="text-ink-subtle" lang="uk">
          {s.nameUk}
        </p>
        <p className="mt-4 max-w-2xl text-sm text-ink">{record.termsOfUse[0].ownership}</p>
        <div className="mt-5 flex flex-wrap gap-3 print:hidden">
          <ButtonLink href={`/organizations/${org.slug}/record.json`}>Download structured record (JSON)</ButtonLink>
          <PrintButton />
          <ButtonLink href={`/verify?record=${org.slug}`} variant="ghost">
            Check a record
          </ButtonLink>
        </div>
      </header>

      <div className="mt-6">
        <Disclaimer title="Fictional organization, demonstration signature">{record.termsOfUse[0].prototype}</Disclaimer>
      </div>

      <div className="mt-8 space-y-10">
        <RecordSection id="summary" number={1} title="Record summary">
          <FactList
            items={[
              { label: "Record", value: <span className="font-mono text-xs">{record.id}</span> },
              { label: "Fingerprint", value: <span className="font-mono">{fingerprint}</span>, note: "Matches the structured copy if neither has been altered" },
              {
                label: "Findings",
                value: `${s.categories.filter((c) => c.status === "meets-standard").length} of ${s.categories.length} categories meet the standard`,
                note: "Each category is set out in section 2. There is no overall score.",
              },
              { label: "Review track", value: s.reviewTrack.name, note: s.reviewTrack.note },
              { label: "Standard", value: `${s.standard.name}, version ${s.standard.version}`, note: s.standard.governance },
              { label: "Valid from", value: date(record.validFrom) },
              { label: "Valid until", value: date(record.validUntil), note: "Statuses lapse if the annual review is not completed" },
              { label: "Identifier", value: `${s.identifier[0].scheme}-${s.identifier[0].value}`, note: s.identifier[0].note },
              { label: "Issued by", value: record.issuer.name },
            ]}
          />
          <p className="mt-4 text-xs text-ink-subtle">
            Overall tier, kept for the methodology and not a ranking: {s.tier.label}. {s.tier.doesNotTellYou}
          </p>
        </RecordSection>

        <RecordSection id="categories" number={2} title="Findings by category">
          <ol className="space-y-4">
            {s.categories.map((c) => (
              <li key={c.id} className="break-inside-avoid rounded-md border border-rule p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <CategoryStatusChip status={c.status} />
                </div>
                {c.reviewerNote && <p className="mt-2 text-sm text-ink">Reviewer note: {c.reviewerNote}</p>}
                <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-ink-subtle">Evidence basis</dt>
                    <dd className="text-ink-muted">{c.evidenceBasis}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle">Method</dt>
                    <dd className="text-ink-muted">{c.method}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-ink-subtle">Limit of this finding</dt>
                    <dd className="text-ink-muted">{c.limit}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-ink-subtle">Comparable topics in other frameworks</dt>
                    <dd className="text-ink-muted">{c.mappings.map((m) => `${m.framework}: ${m.topic}`).join(" · ")}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-subtle">{MAPPING_STATUS}</p>
        </RecordSection>

        <RecordSection id="unable" number={3} title="Checks that could not be done">
          {s.unableToVerify.length === 0 ? (
            <p className="text-sm text-ink-muted">None. Every assessed category could be checked with acceptable evidence.</p>
          ) : (
            <ul className="space-y-3">
              {s.unableToVerify.map((u) => (
                <li key={u.category} className="rounded-md border border-dashed border-rule-strong p-4 text-sm">
                  <p className="font-semibold text-ink">{s.categories.find((c) => c.id === u.category)?.name}: Unable to verify</p>
                  <p className="mt-1 text-ink">{u.reason}</p>
                  <p className="mt-1 text-ink-muted">This is not a finding against the organization.</p>
                </li>
              ))}
            </ul>
          )}
        </RecordSection>

        <RecordSection id="provenance" number={4} title="Provenance and history">
          <FactList
            items={[
              { label: "Lead reviewer", value: record.evidence[0].leadReviewer, note: "Illustrative reviewer ID" },
              { label: "Second reviewer", value: record.evidence[0].secondReviewer, note: "Did not take part in the assessment" },
              { label: "Conflicts of interest", value: record.evidence[0].conflictsDeclared },
              { label: "Underlying documents", value: record.evidence[0].underlyingDocuments },
            ]}
          />
          {s.history.length > 0 && (
            <ol className="mt-4 space-y-2 text-sm">
              {s.history.map((h) => (
                <li key={`${h.date}-${h.summary}`} className="flex gap-3">
                  <span className="w-28 shrink-0 text-ink-subtle">{formatDate(h.date)}</span>
                  <span className="text-ink-muted">{h.summary}</span>
                </li>
              ))}
            </ol>
          )}
        </RecordSection>

        <RecordSection id="check" number={5} title="How anyone can check this record">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted">
            <li>Get the structured copy from the organization. It is the same record as this document, in JSON.</li>
            <li>
              Obtain the issuer&rsquo;s public key once, independently of any record:{" "}
              <span className="break-all font-mono text-xs text-ink">{publicKeyMultibase()}</span>
            </li>
            <li>
              Check the signature with any tool that supports W3C Verifiable Credentials and the eddsa-jcs-2022
              cryptosuite, or with the{" "}
              <Link href="/verify" className="text-accent hover:underline">
                checker on this site
              </Link>
              . No account or access to the registry is needed.
            </li>
            <li>{record.termsOfUse[0].currentStatus}</li>
          </ol>
          <p className="mt-4 text-sm text-ink-muted">
            A valid signature shows the record is exactly what the review function issued. It does not make the findings
            more than they are: this record is {record.termsOfUse[0].notAnEndorsement.map((t) => t.toLowerCase()).join("; ")}.
          </p>
        </RecordSection>
      </div>
    </Container>
  );
}
