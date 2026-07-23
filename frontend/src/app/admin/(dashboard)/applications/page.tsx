import type { Metadata } from 'next';
import { AdminApplicationsList } from '@/features/admin-applications';

export const metadata: Metadata = {
  title: 'Заявки',
};

export default function AdminApplicationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Заявки</h1>
      <AdminApplicationsList />
    </div>
  );
}
