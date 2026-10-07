import { ClosingCta } from "@/components/home/ClosingCta";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProblemSection } from "@/components/home/ProblemSection";
import { TrustPrinciples } from "@/components/home/TrustPrinciples";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <TrustPrinciples />
      <FeaturedWork />
      <ClosingCta />
    </>
  );
}
