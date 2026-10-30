import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Transparency } from '@/components/landing/Transparency';
import { AnalyzerAccess } from '@/components/landing/AnalyzerAccess';
import { Faq } from '@/components/landing/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function LandingPage() {
  useDocumentTitle('');
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Transparency />
      <AnalyzerAccess />
      <Faq />
      <FinalCta />
    </>
  );
}
