import type { Metadata } from 'next';
import { LoginForm } from '@/features/login-otp';

export const metadata: Metadata = {
  title: 'Вход | LumenBridge Finance',
  description: 'Войдите в личный кабинет с помощью SMS-кода',
};

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden bg-[#f1f5f9]">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Вход</h1>
        <p className="text-slate-600 mb-8">
          Войдите, чтобы управлять заявками и отслеживать статус займа
        </p>
        <LoginForm />
      </div>
    </section>
  );
}
