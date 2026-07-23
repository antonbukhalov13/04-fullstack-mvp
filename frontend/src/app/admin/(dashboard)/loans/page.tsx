import type { Metadata } from 'next';
import { AdminLoansList } from '@/features/admin-loans';

export const metadata: Metadata = {
  title: 'Займы',
};

export default function AdminLoansPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Займы</h1>
      <AdminLoansList />
    </div>
  );
}
