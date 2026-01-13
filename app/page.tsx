import { AppHeader } from '@/components/ui/app-header';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { WhySection } from '@/components/home/WhySection';
import { SiteFooter } from '@/components/home/SiteFooter';
// import { ClockSection } from '@/components/home/ClockSection';



export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="flex min-h-screen flex-col">
        <HeroSection />
        {/* <ClockSection /> */}
        <HowItWorksSection />
        <WhySection />
        <SiteFooter />
      </main>
    </>
  );
}
