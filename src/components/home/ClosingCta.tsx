import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

export function ClosingCta() {
  return (
    <section className="bg-ink text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold">For Ukrainian NGOs</h2>
          <p className="mt-3 max-w-md text-white/75">
            Apply for review and see exactly how each answer is used. The standard you are reviewed against is
            proposed to be set by Ukrainian civil society, not by the platform or its funders.
          </p>
          <div className="mt-6">
            <ButtonLink href="/apply" variant="inverse">
              Start an application
            </ButtonLink>
          </div>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold">For donors</h2>
          <p className="mt-3 max-w-md text-white/75">
            Understand exactly what each verification finding means before you rely on it, including what it does not
            cover.
          </p>
          <div className="mt-6">
            <ButtonLink href="/methodology" variant="inverse-outline">
              Read the methodology
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
