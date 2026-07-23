import type { Metadata } from 'next';
import { AdminLoanDetail } from '@/features/admin-loans';

export const metadata: Metadata = {
  title: 'Займ',
};

export default function AdminLoanDetailPage() {
  return <AdminLoanDetail />;
}
