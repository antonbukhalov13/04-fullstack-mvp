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
      <Hero />
      <Calculator />
      <LoanTerms />
      <WhenMoneyNeeded />
      <HowItWorks />
      <TransparentTerms />
      <AboutCompany />
      <CreditHistory />
      <ForBusiness />
      <TrustBlock />
      <FaqPreview />
      <ClientSafety />
      <ContactSection />
      <ContactDetails />
    </>
  );
}
