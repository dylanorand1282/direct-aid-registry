import type { Metadata } from "next";
import { DonorDashboard } from "@/components/dashboard/DonorDashboard";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { PLEDGE_NOTICES } from "@/data/pledge";
import { RECORDS_AS_OF } from "@/data/verificationEvents";
import { formatDate } from "@/lib/format";
import { getDemoDonor } from "@/lib/queries";

export const metadata: Metadata = { title: "Donor dashboard" };

export default function DashboardPage() {
  const donor = getDemoDonor();
  return (
    <>
      <PageHeader
        eyebrow="Donor dashboard · fictional demo persona"
        title={donor.displayName}
        lead="Everything this funder follows in one place: what it pledged, what it is owed in reporting, what organizations have published, and how their verification records have changed."
      />
      <Container className="py-10">
        <Disclaimer title="Simulation and fictional data">
          Every pledge here is simulated. {PLEDGE_NOTICES.banner.replace("Simulation only. ", "")} Organizations, projects,
          updates and verification changes are fictional. Dates are measured from the record date of{" "}
          {formatDate(RECORDS_AS_OF)}. Items you save or pledge are kept in this browser only.
        </Disclaimer>
        <div className="mt-10">
          <DonorDashboard />
        </div>
      </Container>
    </>
  );
}
