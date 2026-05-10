import { CtaSection } from "@/widgets/landing/cta";
import { FeaturesSection } from "@/widgets/landing/features";
import { Footer } from "@/widgets/landing/footer";
import { ForWhoSection } from "@/widgets/landing/for-who";
import { HeroSection } from "@/widgets/landing/hero";
import { HowItWorksSection } from "@/widgets/landing/how-it-works";
import { Navbar } from "@/widgets/landing/navbar";

export function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ForWhoSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
