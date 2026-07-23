import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Заявки',
};

export default function ApplicationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Заявки</h1>
      <p className="text-slate-500">Раздел в разработке</p>
    </div>
  );
}
