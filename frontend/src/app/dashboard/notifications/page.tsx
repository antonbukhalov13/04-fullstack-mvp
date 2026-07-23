import type { Metadata } from 'next';
import { NotificationsList } from '@/features/my-notifications';

export const metadata: Metadata = {
  title: 'Уведомления',
};

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Уведомления</h1>
      <NotificationsList />
    </div>
  );
}
