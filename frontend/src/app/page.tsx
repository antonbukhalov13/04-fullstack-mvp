import { ScrollReveal } from '@/shared/ui';
import { Hero } from '@/widgets/hero';
import { Calculator } from '@/widgets/calculator';
import { LoanTerms } from '@/widgets/loan-terms';
import { WhenMoneyNeeded } from '@/widgets/when-money-needed';
import { HowItWorks } from '@/widgets/how-it-works';
import { TransparentTerms } from '@/widgets/transparent-terms';
import { AboutCompany } from '@/widgets/about-company';
import { ClientSafety } from '@/widgets/client-safety';
import { CreditHistory } from '@/widgets/credit-history';
import { ForBusiness } from '@/widgets/for-business';
import { TrustBlock } from '@/widgets/trust-block';
import { FaqPreview } from '@/widgets/faq-preview';
import { ContactSection } from '@/widgets/contact-form';
import { ContactDetails } from '@/widgets/contact-details';

export default function Home() {
  return (
    <>
      <ScrollReveal>
        <Hero />
      </ScrollReveal>
      <ScrollReveal>
        <LoanTerms />
      </ScrollReveal>
      <ScrollReveal>
        <Calculator />
      </ScrollReveal>
      <ScrollReveal>
        <WhenMoneyNeeded />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      <ScrollReveal>
        <TransparentTerms />
      </ScrollReveal>
      <div aria-hidden className="h-[2px] w-full shrink-0 bg-slate-300" />
      <ScrollReveal>
        <AboutCompany />
      </ScrollReveal>
      <ScrollReveal>
        <CreditHistory />
      </ScrollReveal>
      <ScrollReveal>
        <ForBusiness />
      </ScrollReveal>
      <div aria-hidden className="h-[2px] w-full shrink-0 bg-slate-300" />
      <ScrollReveal>
        <TrustBlock />
      </ScrollReveal>
      <ScrollReveal>
        <FaqPreview />
      </ScrollReveal>
      <ScrollReveal>
        <ClientSafety />
      </ScrollReveal>
      <ScrollReveal>
        <ContactSection />
      </ScrollReveal>
      <ScrollReveal>
        <ContactDetails />
      </ScrollReveal>
    </>
  );
}
