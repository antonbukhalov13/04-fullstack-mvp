import type { Metadata } from 'next';
import { ApplicationsList } from '@/features/my-applications';

export const metadata: Metadata = {
  title: 'Заявки',
};

export default function ApplicationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Заявки</h1>
      <ApplicationsList />
    </div>
  );
}
