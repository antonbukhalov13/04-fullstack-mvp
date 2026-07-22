import { Hero } from '@/widgets/hero';
import { Calculator } from '@/widgets/calculator';
import { LoanTerms } from '@/widgets/loan-terms';
import { WhenMoneyNeeded } from '@/widgets/when-money-needed';

export default function Home() {
  return (
    <>
      <Hero />
      <Calculator />
      <LoanTerms />
      <WhenMoneyNeeded />
    </>
  );
}
