'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { Spinner } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { Pagination } from '@/shared/ui/pagination';
import { LoadingOverlay } from '@/shared/ui/loading-overlay';

interface ClientSummary {
  id: string;
  phone: string;
  name: string | null;
  createdAt: string;
  applicationsCount: number;
  activeLoansCount: number;
  closedLoansCount: number;
  totalLoansAmount: number;
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

export function AdminClientsList() {
  const router = useRouter();
  const [items, setItems] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchClients = async (q: string, off: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (q.trim()) params.search = q.trim();
      params.limit = String(limit);
      params.offset = String(off);
      const qs = new URLSearchParams(params).toString();
      const data = await apiRequest<{ data: ClientSummary[]; total: number }>(`/clients?${qs}`, { admin: true });
      setItems(data.data);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setError(msg ?? 'Не удалось загрузить клиентов');
      } else {
        setError('Не удалось загрузить клиентов');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients('');
  }, []);

  const handleSearch = () => {
    setOffset(0);
    fetchClients(search, 0);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    fetchClients(search, newOffset);
  };

  if (loading && items.length === 0) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
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
          placeholder="Поиск по имени или телефону..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleSearch}
        >
          Найти
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-500">Клиентов не найдено.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Телефон</th>
                <th className="px-4 py-3">Займов</th>
                <th className="px-4 py-3">Активных</th>
                <th className="px-4 py-3">Общая сумма</th>
                <th className="px-4 py-3">Регистрация</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/clients/${c.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-700">{c.applicationsCount}</td>
                  <td className="px-4 py-3">
                    <span className={c.activeLoansCount > 0 ? 'font-medium text-green-700' : 'text-slate-500'}>
                      {c.activeLoansCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{fmt(c.totalLoansAmount)}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(c.createdAt)}</td>
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
