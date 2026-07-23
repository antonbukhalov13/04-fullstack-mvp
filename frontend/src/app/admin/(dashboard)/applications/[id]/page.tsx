import type { Metadata } from 'next';
import { AdminApplicationDetail } from '@/features/admin-applications';

export const metadata: Metadata = {
  title: 'Заявка',
};

export default function AdminApplicationDetailPage() {
  return <AdminApplicationDetail />;
}
