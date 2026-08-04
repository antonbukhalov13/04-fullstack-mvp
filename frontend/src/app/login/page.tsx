import type { Metadata } from 'next';
import { LoginForm } from '@/features/login-otp';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Вход | LumenBridge Finance',
  description: 'Войдите в личный кабинет с помощью SMS-кода',
};

export default function LoginPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
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
      <ScrollReveal direction="right" className="relative w-full max-w-sm">
        <div className="rounded-lg border border-indigo-600 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Вход</h1>
          <p className="text-sm text-slate-500 mb-6">
            Войдите, чтобы управлять заявками и отслеживать статус займа
          </p>
          <LoginForm />
        </div>
      </ScrollReveal>
    </section>
  );
}
