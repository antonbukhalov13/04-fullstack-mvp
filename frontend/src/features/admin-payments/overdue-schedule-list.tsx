'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { Spinner } from '@/shared/ui';
import { Button } from '@/shared/ui/button';

interface OverdueItem {
  id: string;
  dueDate: string;
  amount: number;
  status: string;
  loanId: string;
  loanAmount: number;
  loanStatus: string;
  user: { id: string; name: string | null; phone: string };
}

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' €';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function OverdueScheduleList() {
  const router = useRouter();
  const [items, setItems] = useState<OverdueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ data: OverdueItem[]; total: number; limit: number; offset: number }>('/loans/overdue', { admin: true });
      setItems(res.data);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setError(msg ?? 'Не удалось загрузить просроченные платежи');
      } else {
        setError('Не удалось загрузить просроченные платежи');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const markPending = async (loanId: string, itemId: string) => {
    setActionId(itemId);
    try {
      await apiRequest(`/loans/${loanId}/schedule/${itemId}`, {
        method: 'PATCH',
        admin: true,
        body: { status: 'pending' },
      });
      await fetchItems();
    } catch {
      // ignore
    } finally {
      setActionId(null);
    }
  };

  if (loading && items.length === 0) {
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

  return (
    <div>
      {items.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Просроченных платежей нет.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Клиент</th>
                <th className="px-4 py-3">Займ</th>
                <th className="px-4 py-3">Сумма платежа</th>
                <th className="px-4 py-3">Дата просрочки</th>
                <th className="px-4 py-3">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{item.user.name ?? '—'}</p>
                    <p className="text-xs text-slate-500">{item.user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/loans/${item.loanId}`)}
                      className="text-xs text-indigo-600 hover:underline font-mono"
                    >
                      #{item.loanId.slice(0, 8)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{fmt(item.amount)}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(item.dueDate)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markPending(item.loanId, item.id)}
                      disabled={actionId === item.id}
                      loading={actionId === item.id}
                    >
                      Снять просрочку
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
