'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';

interface Application {
  id: string;
  applicantType: 'individual' | 'business';
  amount: number;
  termDays: number;
  status: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  createdAt: string;
}

function formatAmount(n: number) {
  return n.toLocaleString('ru-RU') + ' €';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function applicantLabel(a: Application) {
  if (a.applicantType === 'business') return a.companyName ?? 'Бизнес';
  return [a.firstName, a.lastName].filter(Boolean).join(' ') || 'Частное лицо';
}

export function ApplicationsList() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<Application[]>('/applications/me');
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown>;
            const msg = Array.isArray(body?.message)
              ? body.message[0]
              : typeof body?.message === 'string'
                ? body.message
                : null;
            setError(msg ?? 'Не удалось загрузить заявки');
          } else {
            setError('Не удалось загрузить заявки');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        У вас пока нет заявок.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Заявка</th>
            <th className="px-4 py-3">Сумма</th>
            <th className="px-4 py-3">Срок</th>
            <th className="px-4 py-3">Дата</th>
            <th className="px-4 py-3">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-900">
                {applicantLabel(a)}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatAmount(a.amount)}</td>
              <td className="px-4 py-3 text-slate-700">{a.termDays} дн.</td>
              <td className="px-4 py-3 text-slate-500">{formatDate(a.createdAt)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={a.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
