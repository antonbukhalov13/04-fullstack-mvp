'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { dispatchNotificationChange } from '@/shared/lib/notification-events';

interface LoanDetail {
  id: string;
  amount: number;
  termDays: number;
  dailyRate: number;
  status: string;
  signedAt: string | null;
  signedIp: string | null;
  signedUserAgent: string | null;
  createdAt: string;
  user: { id: string; name: string | null; phone: string };
  totalRepay: number;
  totalPaid: number;
  remaining: number;
  schedule: { id: string; dueDate: string; amount: number; status: string }[];
  nextPayment: { amount: number; dueDate: string } | null;
  paymentRequests: { id: string; amount: number; reference: string; status: string; createdAt: string }[];
  payments: { id: string; amount: number; date: string }[];
}

const statusLabels: Record<string, string> = {
  pending_signature: 'Ожидает подписания',
  active: 'Активный',
  closed: 'Закрыт',
  overdue: 'Просрочен',
  default: 'Дефолт',
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' €';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function parseUserAgent(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: '—', os: '—' };
  let browser = 'Другой';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Другая';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
}

export function AdminLoanDetail() {
  const params = useParams();
  const loanId = (params?.id ?? '') as string;

  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchLoan = async () => {
    const data = await apiRequest<LoanDetail>(`/loans/${loanId}/admin`, { admin: true });
    setLoan(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchLoan();
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown>;
            const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
            setError(msg ?? 'Не удалось загрузить займ');
          } else {
            setError('Не удалось загрузить займ');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loanId]);

  const updateStatus = async () => {
    if (!newStatus) return;
    if (!window.confirm(`Изменить статус займа на «${statusLabels[newStatus] ?? newStatus}»?`)) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/loans/${loanId}/status`, {
        method: 'PATCH',
        admin: true,
        body: { status: newStatus },
      });
      setActionSuccess(`Статус изменён на «${statusLabels[newStatus] ?? newStatus}»`);
      setNewStatus('');
      await fetchLoan();
      dispatchNotificationChange();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setActionError(msg ?? 'Ошибка при изменении статуса');
      } else {
        setActionError('Ошибка при изменении статуса');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const markPaid = async (itemId: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/loans/${loanId}/schedule/${itemId}`, {
        method: 'PATCH',
        admin: true,
        body: { status: 'paid' },
      });
      setActionSuccess('Платёж отмечен как оплаченный');
      await fetchLoan();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setActionError(msg ?? 'Ошибка при отметке платежа');
      } else {
        setActionError('Ошибка при отметке платежа');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const closeLoan = async () => {
    if (!window.confirm('Закрыть займ? Это действие необратимо.')) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/loans/${loanId}/close`, {
        method: 'POST',
        admin: true,
      });
      setActionSuccess('Займ закрыт');
      await fetchLoan();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setActionError(msg ?? 'Ошибка при закрытии займа');
      } else {
        setActionError('Ошибка при закрытии займа');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
        <div className="mt-3">
          <Link href="/admin/loans" className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>К списку</Link>
        </div>
      </div>
    );
  }

  if (!loan) return null;

  const allowedTransitions: Record<string, string[]> = {
    pending_signature: ['active'],
    active: ['closed'],
    overdue: ['closed'],
    default: ['active', 'closed'],
  };

  const availableStatuses = (allowedTransitions[loan.status] ?? [])
    .map((value) => ({ value, label: statusLabels[value] ?? value }));

  return (
    <div className="space-y-6">
      <Link href="/admin/loans" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Займы
      </Link>

      {/* Параметры займа */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Займ №{loan.id.slice(0, 8)}
          </h2>
          <StatusBadge status={loan.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Клиент</p>
            <p className="font-medium text-slate-900">{loan.user.name ?? '—'}</p>
            <p className="text-xs text-slate-500">{loan.user.phone}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Сумма</p>
            <p className="font-medium text-slate-900">{fmt(loan.amount)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Срок</p>
            <p className="font-medium text-slate-900">{loan.termDays} дн.</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Ставка</p>
            <p className="font-medium text-slate-900">{(loan.dailyRate * 100).toFixed(1)}% / дн.</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">К возврату</p>
            <p className="font-medium text-slate-900">{fmt(loan.totalRepay)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Оплачено</p>
            <p className="font-medium text-green-700">{fmt(loan.totalPaid)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Остаток</p>
            <p className="font-medium text-orange-700">{fmt(loan.remaining)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Дата выдачи</p>
            <p className="font-medium text-slate-900">
              {loan.signedAt ? fmtDate(loan.signedAt) : 'Не подписан'}
            </p>
          </div>
        </div>

        {loan.signedIp && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">IP подписания</p>
              <p className="font-mono text-slate-700">{loan.signedIp}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Браузер / ОС</p>
              {(() => {
                const { browser, os } = parseUserAgent(loan.signedUserAgent);
                return (
                  <p className="text-slate-700">
                    {browser} <span className="text-slate-400">·</span> {os}
                  </p>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* График платежей */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">График платежей</h3>

        {loan.schedule.length === 0 ? (
          <p className="text-sm text-slate-500">График ещё не сформирован</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">№</th>
                  <th className="px-4 py-2">Дата</th>
                  <th className="px-4 py-2">Сумма</th>
                  <th className="px-4 py-2">Статус</th>
                  <th className="px-4 py-2">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loan.schedule.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 text-slate-600">{i + 1}</td>
                    <td className="px-4 py-2 text-slate-700">{fmtDate(item.dueDate)}</td>
                    <td className="px-4 py-2 text-slate-700">{fmt(item.amount)}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-2">
                      {item.status !== 'paid' && loan.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markPaid(item.id)}
                          disabled={actionLoading}
                        >
                          Отметить оплату
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Заявки на оплату */}
      {loan.paymentRequests.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Заявки на оплату</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Сумма</th>
                  <th className="px-4 py-2">Reference</th>
                  <th className="px-4 py-2">Дата</th>
                  <th className="px-4 py-2">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loan.paymentRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 text-slate-700">{fmt(pr.amount)}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono text-xs">{pr.reference}</td>
                    <td className="px-4 py-2 text-slate-500">{fmtDate(pr.createdAt)}</td>
                    <td className="px-4 py-2"><StatusBadge status={pr.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* История платежей */}
      {loan.payments.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">История платежей</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Сумма</th>
                  <th className="px-4 py-2">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loan.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 text-green-700 font-medium">{fmt(p.amount)}</td>
                    <td className="px-4 py-2 text-slate-500">{fmtDate(p.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Действия */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Действия</h3>

        <div className="space-y-4">
          {/* Смена статуса */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Изменить статус</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Выберите статус</option>
                {availableStatuses.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button
                variant="primary"
                onClick={updateStatus}
                disabled={!newStatus || actionLoading}
                loading={actionLoading}
              >
                Применить
              </Button>
            </div>
          </div>

          {/* Закрыть займ */}
          {loan.status !== 'closed' && (
            <div>
              <Button
                variant="danger"
                onClick={closeLoan}
                disabled={actionLoading}
                loading={actionLoading}
              >
                Закрыть займ
              </Button>
            </div>
          )}

          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          {actionSuccess && <p className="text-sm text-green-600">{actionSuccess}</p>}
        </div>
      </div>
    </div>
  );
}
