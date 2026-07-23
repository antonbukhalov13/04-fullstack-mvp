import type { Metadata } from 'next';
import { AdminNotificationsList } from '@/features/admin-notifications';

export const metadata: Metadata = {
  title: 'Уведомления',
};

export default function AdminNotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Уведомления</h1>
      <AdminNotificationsList />
    </div>
  );
}
