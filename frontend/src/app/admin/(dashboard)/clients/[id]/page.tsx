import type { Metadata } from 'next';
import { AdminClientDetail } from '@/features/admin-clients';

export const metadata: Metadata = {
  title: 'Клиент',
};

export default function AdminClientDetailPage() {
  return <AdminClientDetail />;
}
