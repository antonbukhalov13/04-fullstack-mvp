'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError, setAdminAuthToken } from '@/shared/api';
import { Spinner } from '@/shared/ui';

interface AdminLoginResponse {
  accessToken: string;
  admin: { id: string; login: string; role: string };
}

export function AdminLoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<AdminLoginResponse>('/admin-auth/login', {
        method: 'POST',
        body: { login: login.trim(), password: password.trim() },
      });
      setAdminAuthToken(res.accessToken);
      localStorage.setItem('admin_token', res.accessToken);
      localStorage.setItem('admin_user', JSON.stringify(res.admin));
      router.push('/admin/applications');
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message)
          ? body.message[0]
          : typeof body?.message === 'string'
            ? body.message
            : null;
        setError(msg ?? 'Неверный логин или пароль');
      } else {
        setError('Неверный логин или пароль');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="admin-login" className="block text-sm font-medium text-slate-700 mb-1">
          Логин
        </label>
        <input
          id="admin-login"
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Введите логин"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1">
          Пароль
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={!login.trim() || !password.trim() || loading}
        className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? <Spinner size="sm" className="mr-2" /> : null}
        Войти
      </button>
    </form>
  );
}
