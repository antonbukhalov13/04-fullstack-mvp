import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/login-otp';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Вход | LumenBridge Finance',
  description: 'Войдите в личный кабинет с помощью SMS-кода',
};

export default function LoginPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
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
      <div className="relative flex flex-col items-center">
        <ScrollReveal direction="right" className="mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-10 w-10" />
            <span className="flex flex-col leading-none">
              <span className="text-xl font-bold text-white leading-none">LumenBridge</span>
              <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Finance
              </span>
            </span>
          </Link>
        </ScrollReveal>
        <ScrollReveal direction="right" className="relative w-full max-w-sm">
          <div className="rounded-lg border border-indigo-600 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Вход</h1>
            <p className="text-sm text-slate-700 mb-6">
              Войдите, чтобы управлять заявками и отслеживать статус займа
            </p>
            <LoginForm />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
