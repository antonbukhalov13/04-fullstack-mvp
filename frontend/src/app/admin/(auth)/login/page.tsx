import type { Metadata } from 'next';
import { AdminLoginForm } from '@/features/admin-login';

export const metadata: Metadata = {
  title: 'Вход в админ-панель',
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4 pt-24">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Админ-панель</h1>
          <p className="text-sm text-slate-500 mb-6">Войдите для управления системой</p>
          <AdminLoginForm />
          <p className="mt-4 text-center text-xs text-slate-400">
            Тестовые данные: admin / admin123 · operator / operator123
          </p>
        </div>
      </div>
    </div>
  );
}
