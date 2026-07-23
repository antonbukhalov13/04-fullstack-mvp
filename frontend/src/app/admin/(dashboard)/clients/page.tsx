import type { Metadata } from 'next';
import { AdminClientsList } from '@/features/admin-clients';

export const metadata: Metadata = {
  title: 'Клиенты',
};

export default function AdminClientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Клиенты</h1>
      <AdminClientsList />
    </div>
  );
}
