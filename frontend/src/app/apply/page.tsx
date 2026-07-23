import type { Metadata } from 'next';
import { ApplyForm } from '@/features/apply-loan';

export const metadata: Metadata = {
  title: 'Подать заявку | LumenBridge Finance',
  description: 'Оформите заявку на займ онлайн — для физических лиц и бизнеса',
};

export default function ApplyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Подать заявку</h1>
      <p className="text-slate-600 mb-8">
        Заполните форму, и мы свяжемся с вами для уточнения деталей
      </p>
      <ApplyForm />
    </section>
  );
}
