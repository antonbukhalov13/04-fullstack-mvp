import type { Metadata } from 'next';
import { LoanDetailCard } from '@/features/loan-detail';

export const metadata: Metadata = {
  title: 'Заявка',
};

export default function LoanDetailPage() {
  return <LoanDetailCard />;
}
