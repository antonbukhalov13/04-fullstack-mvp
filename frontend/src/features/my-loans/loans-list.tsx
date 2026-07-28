'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';

interface LoanItem {
  id: string;
  amount: number;
  termDays: number;
  status: string;
  signedAt: string | null;
  createdAt: string;
  nextPayment: { amount: number; dueDate: string } | null;
  lastPaymentDate: string | null;
}

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' €';
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function LoansList() {
  const router = useRouter();
  const [items, setItems] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{ data: LoanItem[]; total: number; limit: number; offset: number }>('/loans/me');
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
            setError(msg ?? 'Не удалось загрузить займы');
          } else {
            setError('Не удалось загрузить займы');
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
        У вас пока нет займов.
      </div>
    );
  }

  const active = items.filter((l) => l.status === 'active' || l.status === 'pending_signature');
  const closed = items.filter((l) => l.status === 'closed');

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Активные</h2>
        {active.length === 0 ? (
          <p className="text-sm text-slate-500">Нет активных займов.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Получен</th>
                  <th className="px-4 py-3">Следующий платёж</th>
                  <th className="px-4 py-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {active.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/loans/${l.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{fmt(l.amount)}</td>
                    <td className="px-4 py-3 text-slate-700">{fmtDate(l.signedAt)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {l.nextPayment
                        ? `${fmt(l.nextPayment.amount)} · ${fmtDate(l.nextPayment.dueDate)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Закрытые</h2>
        {closed.length === 0 ? (
          <p className="text-sm text-slate-500">Нет закрытых займов.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Получен</th>
                  <th className="px-4 py-3">Погашён</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {closed.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/loans/${l.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{fmt(l.amount)}</td>
                    <td className="px-4 py-3 text-slate-700">{fmtDate(l.signedAt)}</td>
                    <td className="px-4 py-3 text-slate-700">{fmtDate(l.lastPaymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
