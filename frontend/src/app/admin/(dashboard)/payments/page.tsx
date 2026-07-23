import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Платежи',
};

export default function AdminPaymentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Платежи</h1>
      <p className="text-sm text-slate-500">Раздел в разработке</p>
    </div>
  );
}
