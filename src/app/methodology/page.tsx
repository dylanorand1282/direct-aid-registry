import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { RecordSection } from "@/components/layout/RecordSection";
import { CategorySection } from "@/components/methodology/CategorySection";
import { EvidenceSection } from "@/components/methodology/EvidenceSection";
import { GovernanceSection } from "@/components/methodology/GovernanceSection";
import { ProportionalitySection } from "@/components/methodology/ProportionalitySection";
import { MeaningSection } from "@/components/methodology/NotSection";
import {
  DisclosureSection,
  LifecycleSection,
  OpenQuestionsSection,
  ReviewersSection,
  UnverifiableSection,
} from "@/components/methodology/ProcessSections";
import { TierSection } from "@/components/methodology/TierSection";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { REGISTRY_PRINCIPLE, REVIEW_CYCLE_MONTHS, STANDARD_DATE, STANDARD_VERSION } from "@/data/methodology";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Verification methodology" };

type SectionId = (typeof SECTIONS)[number]["id"];
const num = (id: SectionId) => SECTIONS.findIndex((s) => s.id === id) + 1;

const SECTIONS = [
  { id: "meaning", title: "What a status means, and what it does not" },
  { id: "who-governs", title: "Who governs the standard" },
  { id: "tiers", title: "Tiers" },
  { id: "categories", title: "The six categories" },
  { id: "proportionality", title: "Proportionate review" },
  { id: "evidence", title: "How evidence is evaluated" },
  { id: "reviewers", title: "Who reviews" },
  { id: "cycle", title: "Review cycle and expiry" },
  { id: "unverifiable", title: "When information cannot be verified" },
  { id: "disclosure", title: "What is published" },
  { id: "draft", title: "Status of this draft" },
] as const;

export default function MethodologyPage() {
  return (
    <>
      <div className="border-b border-rule bg-surface">
        <Container className="py-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Verification methodology</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
            How organizations are verified, and exactly what a status does and does not tell you
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            A proposed standard for assessing Ukrainian humanitarian organizations in six categories, reviewed
            against graded evidence and renewed every {REVIEW_CYCLE_MONTHS} months.
          </p>
          <blockquote className="mt-6 max-w-3xl border-l-4 border-accent pl-4 font-serif text-lg text-ink">
            {REGISTRY_PRINCIPLE}
          </blockquote>
          <p className="mt-4 text-sm text-ink-subtle">
            Version {STANDARD_VERSION} · {formatDate(STANDARD_DATE)} · Proposed for ratification by a Ukrainian-led{" "}
            <a href="#who-governs" className="text-accent hover:underline">
              Standards Council
            </a>
          </p>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Methodology contents" className="hidden lg:block">
          <div className="sticky top-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Contents</p>
            <ol className="mt-3 space-y-2 text-sm">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-ink-muted hover:text-accent">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 space-y-10">
          <Disclaimer title="Prototype standard">
            This methodology is a draft written for the prototype, outside Ukraine. It has not been adopted by any
            body, has no authority until Ukrainian civil society ratifies it, and no organization has been assessed
            under it. Every status shown on this site belongs to a fictional
            organization and is illustrative.
          </Disclaimer>

          <RecordSection id="meaning" number={num("meaning")} title={SECTIONS[0].title}>
            <MeaningSection />
          </RecordSection>

          <RecordSection
            id="who-governs"
            number={num("who-governs")}
            title="Who governs the standard"
            lead="Ukrainian civil society holds authority over the standard: how criteria change, appeals, reviewer accountability, conflicts of interest, complaints and periodic review. Neither the platform operator nor funders can change the standard or influence a decision."
          >
            <GovernanceSection />
          </RecordSection>

          <RecordSection
            id="tiers"
            number={num("tiers")}
            title="Tiers"
            lead="A tier summarises which categories meet the standard. It is a convenience, not a score: the categories underneath it carry the information."
          >
            <TierSection />
          </RecordSection>

          <RecordSection
            id="categories"
            number={num("categories")}
            title="The six categories"
            lead="Each category asks one question, sets out the criteria that must all be satisfied, and states the narrowest correct reading of a Meets standard."
          >
            <CategorySection />
          </RecordSection>

          <RecordSection
            id="proportionality"
            number={num("proportionality")}
            title="Proportionate review"
            lead="What is asked of an organization scales with its size. A volunteer group is not asked for what a $1 million organization is. Tracks change the scope of a review, never what a status means."
          >
            <ProportionalitySection />
          </RecordSection>

          <RecordSection
            id="evidence"
            number={num("evidence")}
            title="How evidence is evaluated"
            lead="Evidence is graded by how independent it is of the organization. The grade, not the volume of documents, decides what a reviewer can conclude."
          >
            <EvidenceSection />
          </RecordSection>

          <RecordSection
            id="reviewers"
            number={num("reviewers")}
            title="Who reviews"
            lead="Reviews are carried out by trained reviewers who work for the review function, not for the organizations listed or for any donor."
          >
            <ReviewersSection />
          </RecordSection>

          <RecordSection
            id="cycle"
            number={num("cycle")}
            title="Review cycle and expiry"
            lead={`A status lasts ${REVIEW_CYCLE_MONTHS} months from its review date. It expires if not renewed, and can be re-reviewed or suspended at any time.`}
          >
            <LifecycleSection />
          </RecordSection>

          <RecordSection
            id="unverifiable"
            number={num("unverifiable")}
            title="When information cannot be verified"
            lead="War destroys records, closes registries and makes sites unsafe to reach. The standard treats these as reasons a check could not be done, not as findings against the organization, and never as grounds for a Meets standard."
          >
            <UnverifiableSection />
          </RecordSection>

          <RecordSection
            id="disclosure"
            number={num("disclosure")}
            title="What is published"
            lead="Profiles publish decisions and their reasons. Evidence is reviewed but not published, to protect the organization's staff and the people they serve."
          >
            <DisclosureSection />
          </RecordSection>

          <RecordSection
            id="draft"
            number={num("draft")}
            title="Status of this draft"
            lead={`Version ${STANDARD_VERSION}. These questions need answers before the standard could be used for real:`}
          >
            <OpenQuestionsSection />
          </RecordSection>
        </div>
      </Container>
    </>
  );
}
