import type { Metadata } from 'next';
import { AdminUsersList } from '@/features/admin-users';

export const metadata: Metadata = {
  title: 'Администраторы',
};

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Администраторы</h1>
      <AdminUsersList />
    </div>
  );
}
