import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <PageHeader eyebrow="Not found" title="There is no record at this address." />
      <Section>
        <p className="text-ink-muted">The organization or project may not exist in the prototype&rsquo;s fictional data set.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/organizations">Browse organizations</ButtonLink>
          <ButtonLink href="/needs" variant="secondary">
            See current needs
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
