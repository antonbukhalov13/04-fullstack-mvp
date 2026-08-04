import type { Metadata } from 'next';
import { FaqContent } from './faq-content';

export const metadata: Metadata = {
  title: 'Часто задаваемые вопросы',
};

export default function FaqPage() {
  return <FaqContent />;
}
