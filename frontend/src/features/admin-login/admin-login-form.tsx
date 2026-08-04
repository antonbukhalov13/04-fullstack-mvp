'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError, setAdminAuthToken } from '@/shared/api';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

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
        skipAuthRedirect: true,
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
      <Input
        id="admin-login"
        label="Логин"
        type="text"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        placeholder="Введите логин"
        required
      />
      <Input
        id="admin-password"
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Введите пароль"
        required
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={!login.trim() || !password.trim() || loading}
        className="w-full"
      >
        Войти
      </Button>
    </form>
  );
}
