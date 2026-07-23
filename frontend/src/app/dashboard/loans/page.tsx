import type { Metadata } from 'next';
import { LoansList } from '@/features/my-loans';

export const metadata: Metadata = {
  title: 'Мои займы',
};

export default function LoansPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Мои займы</h1>
      <LoansList />
    </div>
  );
}
