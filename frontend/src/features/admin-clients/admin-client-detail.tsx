'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';

interface LoanDetail {
  id: string;
  amount: number;
  termDays: number;
  status: string;
  signedAt: string | null;
  createdAt: string;
  scheduleItems: { dueDate: string; amount: number; status: string }[];
  payments: { amount: number; date: string }[];
  application: { id: string; status: string } | null;
}

interface PaymentRequestDetail {
  id: string;
  amount: number;
  reference: string;
  status: string;
  createdAt: string;
  loan: { id: string; amount: number };
}

interface ClientDetail {
  id: string;
  phone: string;
  name: string | null;
  createdAt: string;
  applications: { id: string; applicantType: string; amount: number; termDays: number; status: string; createdAt: string }[];
  loans: LoanDetail[];
  paymentRequests: PaymentRequestDetail[];
}

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' €';
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function AdminClientDetail() {
  const params = useParams();
  const clientId = (params?.id ?? '') as string;
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<ClientDetail>(`/clients/${clientId}`, { admin: true });
        if (!cancelled) setClient(data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown>;
            const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
            setError(msg ?? 'Не удалось загрузить клиента');
          } else {
            setError('Не удалось загрузить клиента');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [clientId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
        <div className="mt-3"><Link href="/admin/clients" className="text-indigo-600 hover:underline text-sm">← К списку</Link></div>
      </div>
    );
  }
  if (!client) return null;

  const activeLoans = client.loans.filter((l) => l.status === 'active' || l.status === 'pending_signature');
  const closedLoans = client.loans.filter((l) => l.status === 'closed');
  const totalPayments = client.loans.reduce((sum, l) => sum + l.payments.reduce((s, p) => s + p.amount, 0), 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" className="text-sm text-indigo-600 hover:underline">← Клиенты</Link>

      {/* Контакты */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Клиент</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Имя</p>
            <p className="font-medium text-slate-900">{client.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Телефон</p>
            <p className="font-medium text-slate-900">{client.phone}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Дата регистрации</p>
            <p className="font-medium text-slate-900">{fmtDate(client.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Всего займов</p>
            <p className="font-medium text-slate-900">{client.loans.length}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Активных</p>
            <p className="font-medium text-green-700">{activeLoans.length}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Всего выплачено</p>
            <p className="font-medium text-slate-900">{fmt(totalPayments)}</p>
          </div>
        </div>
      </div>

      {/* История заявок */}
      {client.applications.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Заявки</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Тип</th>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Срок</th>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {client.applications.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{a.applicantType === 'business' ? 'Бизнес' : 'Физлицо'}</td>
                    <td className="px-4 py-3 text-slate-700">{fmt(a.amount)}</td>
                    <td className="px-4 py-3 text-slate-700">{a.termDays} дн.</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(a.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Активные займы */}
      {activeLoans.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Активные займы</h3>
          <div className="space-y-3">
            {activeLoans.map((l) => {
              const nextPending = l.scheduleItems.find((s) => s.status === 'pending');
              return (
                <div key={l.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2 sm:gap-6">
                    <span className="font-medium text-slate-900">{fmt(l.amount)}</span>
                    <span className="text-slate-600">{l.termDays} дн.</span>
                    {nextPending && (
                      <span className="text-slate-500">
                        След. платёж: {fmt(nextPending.amount)} · {fmtDate(nextPending.dueDate)}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Закрытые займы */}
      {closedLoans.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Закрытые займы</h3>
          <div className="space-y-2">
            {closedLoans.map((l) => (
              <div key={l.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
                <span className="text-slate-700">{fmt(l.amount)} · {l.termDays} дн.</span>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* История платежей */}
      {client.paymentRequests.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Заявки на оплату</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {client.paymentRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{fmt(pr.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{pr.reference}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(pr.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
