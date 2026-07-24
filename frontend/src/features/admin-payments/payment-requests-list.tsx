'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';

interface PaymentRequest {
  id: string;
  amount: number;
  reference: string;
  status: string;
  createdAt: string;
  loan: { id: string; amount: number; status: string };
  user: { id: string; phone: string; name: string | null };
}

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидают' },
  { value: 'approved', label: 'Подтверждены' },
  { value: 'rejected', label: 'Отклонены' },
];

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' €';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PaymentRequestsList() {
  const [items, setItems] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchItems = async (st: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = st ? `?status=${st}` : '';
      const data = await apiRequest<PaymentRequest[]>(`/payment-requests${qs}`, { admin: true });
      setItems(data);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setError(msg ?? 'Не удалось загрузить заявки');
      } else {
        setError('Не удалось загрузить заявки');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(statusFilter);
  }, []);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchItems(value);
  };

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    setActionId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/payment-requests/${id}`, {
        method: 'PATCH',
        admin: true,
        body: { status },
      });
      setActionSuccess(status === 'approved' ? 'Заявка подтверждена' : 'Заявка отклонена');
      await fetchItems(statusFilter);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setActionError(msg ?? 'Ошибка при обработке заявки');
      } else {
        setActionError('Ошибка при обработке заявки');
      }
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
      <div className="flex items-center gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{actionSuccess}</div>
      )}

      {items.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-500">
          Заявок на оплату не найдено.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Клиент</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Займ</th>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{pr.user.name ?? '—'}</p>
                    <p className="text-xs text-slate-500">{pr.user.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{fmt(pr.amount)}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{pr.reference}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">#{pr.loan.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(pr.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
                  <td className="px-4 py-3">
                    {pr.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decide(pr.id, 'approved')}
                          disabled={actionId === pr.id}
                          className="text-xs font-medium text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
                        >
                          {actionId === pr.id ? <Spinner size="sm" /> : 'Подтвердить'}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => decide(pr.id, 'rejected')}
                          disabled={actionId === pr.id}
                          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
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
