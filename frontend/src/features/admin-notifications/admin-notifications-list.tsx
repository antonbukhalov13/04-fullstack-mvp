'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/shared/api';
import { Spinner } from '@/shared/ui';

interface AdminNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user: { id: string; name: string | null; phone: string };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function typeIcon(type: string) {
  if (type.includes('approved')) return '✓';
  if (type.includes('rejected') || type.includes('overdue')) return '✕';
  if (type.includes('created') || type.includes('signed')) return '●';
  if (type.includes('recorded') || type.includes('closed')) return '✓';
  return '○';
}

function typeColor(type: string, isRead: boolean) {
  if (isRead) return 'text-slate-400';
  if (type.includes('approved') || type.includes('signed') || type.includes('recorded') || type.includes('closed'))
    return 'text-green-500';
  if (type.includes('rejected') || type.includes('overdue')) return 'text-red-500';
  return 'text-indigo-500';
}

function typeLabel(type: string) {
  if (type.includes('application')) return 'Заявка';
  if (type.includes('loan')) return 'Займ';
  if (type.includes('payment-request')) return 'Заявка на оплату';
  if (type.includes('payment')) return 'Платёж';
  return 'Система';
}

export function AdminNotificationsList() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{ data: AdminNotification[]; total: number; limit: number; offset: number }>('/admin/notifications', { admin: true });
        if (!cancelled) setItems(res.data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown>;
            const msg = Array.isArray(body?.message)
              ? body.message[0]
              : typeof body?.message === 'string'
                ? body.message
                : null;
            setError(msg ?? 'Не удалось загрузить уведомления');
          } else {
            setError('Не удалось загрузить уведомления');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const markAsRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await apiRequest(`/admin/notifications/${id}/read`, { method: 'PATCH', admin: true });
      window.dispatchEvent(new CustomEvent('notification-read'));
    } catch {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
  };

  const markAllAsRead = async () => {
    const u = items.filter((n) => !n.isRead).length;
    if (u === 0) return;
    try {
      await apiRequest('/admin/notifications/read-all', { method: 'PATCH', admin: true });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent('notification-read'));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Уведомлений пока нет.
      </div>
    );
  }

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Непрочитанных: <span className="font-medium text-slate-700">{unread}</span>
        </p>
        <button
          onClick={unread > 0 ? markAllAsRead : undefined}
          className={[
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            unread > 0
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
              : 'bg-indigo-100 text-indigo-400 cursor-default',
          ].join(' ')}
        >
          Отметить все
        </button>
      </div>
      <div className="space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={[
              'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
              n.isRead
                ? 'border-slate-200 bg-white text-slate-500'
                : 'border-indigo-200 bg-indigo-50/50 text-slate-900 cursor-pointer hover:bg-indigo-50',
            ].join(' ')}
          >
            <span className={`mt-0.5 text-base ${typeColor(n.type, n.isRead)}`}>
              {typeIcon(n.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                  {typeLabel(n.type)}
                </span>
                <span className="text-xs text-slate-400">
                  {n.user.name ?? '—'} · {n.user.phone}
                </span>
              </div>
              <p className={[!n.isRead ? 'font-medium' : ''].join(' ')}>{n.message}</p>
              <p className="mt-0.5 text-xs text-slate-400">{fmtDate(n.createdAt)}</p>
            </div>
            {!n.isRead && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
