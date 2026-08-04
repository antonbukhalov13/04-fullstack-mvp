import type { Metadata } from 'next';
import { ApplyForm } from '@/features/apply-loan';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Подать заявку | LumenBridge Finance',
  description: 'Оформите заявку на займ онлайн — для физических лиц и бизнеса',
};

export default function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(123,104,238,0.28),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(49,46,129,0.45),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>
      <ScrollReveal direction="left">
        <div className="relative mx-auto w-full max-w-2xl px-4 pt-10 pb-16">
          <h1 className="text-3xl font-bold text-white mb-2">Подать заявку</h1>
          <p className="text-slate-400 mb-6">
            Заполните форму, и мы свяжемся с вами для уточнения деталей
          </p>
          <div className="rounded-xl border border-indigo-600 bg-white p-6 shadow-sm sm:p-8">
            <ApplyForm searchParams={searchParams} />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
