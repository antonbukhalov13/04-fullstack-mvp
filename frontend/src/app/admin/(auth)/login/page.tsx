import type { Metadata } from 'next';
import { AdminLoginForm } from '@/features/admin-login';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Вход в админ-панель',
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>
      <ScrollReveal direction="left" className="relative w-full max-w-sm">
        <div className="rounded-lg border border-indigo-600 bg-slate-900/70 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-white mb-1">Админ-панель</h1>
          <p className="text-sm text-slate-400 mb-6">Войдите для управления системой</p>
          <AdminLoginForm />
          <p className="mt-4 text-center text-xs text-slate-500">
            Тестовые данные: admin / admin123 · operator / operator123
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
