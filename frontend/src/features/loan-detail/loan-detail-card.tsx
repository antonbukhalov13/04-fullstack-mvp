'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';

interface ScheduleItem {
  id: string;
  dueDate: string;
  amount: number;
  status: string;
}

interface LoanDetail {
  id: string;
  amount: number;
  termDays: number;
  dailyRate: number;
  status: string;
  signedAt: string | null;
  createdAt: string;
  totalRepay: number;
  schedule: ScheduleItem[];
  nextPayment: { amount: number; dueDate: string } | null;
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

function dailyRatePercent(r: number) {
  return (r * 100).toFixed(1) + '%';
}

export function LoanDetailCard() {
  const params = useParams();
  const loanId = (params?.id ?? '') as string;
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<LoanDetail>(`/loans/${loanId}`);
        if (!cancelled) setLoan(data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown>;
            const msg = Array.isArray(body?.message)
              ? body.message[0]
              : typeof body?.message === 'string'
                ? body.message
                : null;
            setError(msg ?? 'Не удалось загрузить заём');
          } else {
            setError('Не удалось загрузить заём');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loanId]);

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
        <div className="mt-3">
          <Link href="/dashboard/loans" className="text-indigo-600 hover:underline text-sm">
            ← Вернуться к списку
          </Link>
        </div>
      </div>
    );
  }

  if (!loan) return null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/loans" className="text-sm text-indigo-600 hover:underline">
        ← Мои займы
      </Link>

      {/* Карточка займа */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Заём №{loan.id.slice(0, 8)}</h2>
          <StatusBadge status={loan.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Сумма</p>
            <p className="font-semibold text-slate-900 text-lg">{fmt(loan.amount)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Ставка</p>
            <p className="font-semibold text-slate-900">{dailyRatePercent(loan.dailyRate)} / день</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Срок</p>
            <p className="font-semibold text-slate-900">{loan.termDays} дн.</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">К возврату</p>
            <p className="font-semibold text-slate-900 text-lg">{fmt(loan.totalRepay)}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-6 text-sm text-slate-600">
          {loan.signedAt && (
            <span>Подписан: {fmtDate(loan.signedAt)}</span>
          )}
          {loan.nextPayment && (
            <span>
              Следующий платёж:{' '}
              <span className="font-medium text-slate-900">
                {fmt(loan.nextPayment.amount)} · {fmtDate(loan.nextPayment.dueDate)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* График платежей */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">График платежей</h3>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">№</th>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loan.schedule.map((item, i) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 text-slate-700">{fmtDate(item.dueDate)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{fmt(item.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
