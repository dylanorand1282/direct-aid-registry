import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { RecordChecker, RecordCheckerWithParams } from "@/components/portable/RecordChecker";
import { getOrganizations } from "@/lib/queries";
import { publicKeyMultibase } from "@/lib/portable/record";
import { cachedEarlierCopies } from "@/lib/portable/cached";

export const metadata: Metadata = { title: "Check a record" };

export default async function VerifyPage() {
  const options = getOrganizations().map(({ slug, name }) => ({ slug, name }));
  const earlier = await cachedEarlierCopies();
  return (
    <>
      <PageHeader
        eyebrow="For funders off the platform · prototype"
        title="Check a due-diligence record"
        lead="Organizations own their records and can share them with any funder. This checker confirms a shared record has not been altered, is still in date, and matches the current status. The same check runs in any tool that supports W3C Verifiable Credentials, without this website."
      />
      <Container className="max-w-3xl py-10">
        <Suspense fallback={<RecordChecker options={options} earlier={earlier} initialSlug={null} />}>
          <RecordCheckerWithParams options={options} earlier={earlier} />
        </Suspense>
        <div className="mt-10 border-t border-rule pt-6 text-sm text-ink-muted">
          <p className="font-semibold text-ink">The registry&rsquo;s public key</p>
          <p className="mt-1">
            Records are checked against this key, which a funder should obtain once from a source they trust, not from
            the record itself. It is also published at <span className="font-mono text-xs">/issuer.json</span>.
          </p>
          <p className="mt-2 break-all font-mono text-xs text-ink">{publicKeyMultibase()}</p>
          <p className="mt-2 text-xs text-ink-subtle">Demonstration key. Its private half is in the prototype&rsquo;s source code.</p>
        </div>
      </Container>
    </>
  );
}
