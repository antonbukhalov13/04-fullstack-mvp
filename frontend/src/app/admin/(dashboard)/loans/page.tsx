import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Займы',
};

export default function AdminLoansPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Займы</h1>
      <p className="text-sm text-slate-500">Раздел в разработке</p>
    </div>
  );
}
