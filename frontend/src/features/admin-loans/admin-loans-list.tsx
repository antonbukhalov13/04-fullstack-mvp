'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { Pagination } from '@/shared/ui/pagination';
import { LoadingOverlay } from '@/shared/ui/loading-overlay';

interface Loan {
  id: string;
  amount: number;
  termDays: number;
  status: string;
  signedAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; phone: string };
  totalRepay: number;
  nextPayment: { amount: number; dueDate: string } | null;
}

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'pending_signature', label: 'Ожидают подписания' },
  { value: 'active', label: 'Активные' },
  { value: 'closed', label: 'Закрытые' },
  { value: 'overdue', label: 'Просроченные' },
  { value: 'default', label: 'Дефолт' },
];

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

export function AdminLoansList() {
  const router = useRouter();

  const [items, setItems] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchLoans = async (s: string, st: string, off: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (s.trim()) params.search = s.trim();
      if (st) params.status = st;
      params.limit = String(limit);
      params.offset = String(off);
      const qs = new URLSearchParams(params).toString();
      const data = await apiRequest<{ data: Loan[]; total: number }>(`/loans?${qs}`, { admin: true });
      setItems(data.data);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setError(msg ?? 'Не удалось загрузить займы');
      } else {
        setError('Не удалось загрузить займы');
      }
    } finally {
      setLoading(false);
    }
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchLoans(search, statusFilter);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      fetchLoans(search, statusFilter, 0);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const handleSearch = () => {
    setOffset(0);
    fetchLoans(search, statusFilter, 0);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setOffset(0);
    fetchLoans(search, value, 0);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchLoans(search, statusFilter, newOffset);
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
    <LoadingOverlay loading={loading} hasData={items.length > 0}>
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Поиск по имени, телефону..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <Button
          variant="primary"
          size="md"
          onClick={handleSearch}
        >
          Найти
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-500">
          Займов не найдено.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Клиент</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Срок</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((loan) => (
                <tr
                  key={loan.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/loans/${loan.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{loan.user.name ?? '—'}</p>
                    <p className="text-xs text-slate-500">{loan.user.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{fmt(loan.amount)}</td>
                  <td className="px-4 py-3 text-slate-700">{loan.termDays} дн.</td>
                  <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(loan.signedAt ?? loan.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={total} limit={limit} offset={offset} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
    </LoadingOverlay>
  );
}
