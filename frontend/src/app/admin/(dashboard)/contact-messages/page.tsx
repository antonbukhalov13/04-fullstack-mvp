import type { Metadata } from 'next';
import { AdminContactMessagesList } from '@/features/admin-contact-messages';

export const metadata: Metadata = {
  title: 'Сообщения',
};

export default function AdminContactMessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Сообщения из формы связи</h1>
      <AdminContactMessagesList />
    </div>
  );
}
