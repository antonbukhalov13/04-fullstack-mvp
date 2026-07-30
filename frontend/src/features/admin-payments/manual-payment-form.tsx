'use client';

import { useState, useRef, useEffect } from 'react';
import { apiRequest, ApiError } from '@/shared/api';
import { Spinner } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { dispatchNotificationChange } from '@/shared/lib/notification-events';

interface LoanSearchResult {
  id: string;
  amount: number;
  status: string;
  user: { name: string | null; phone: string };
}

export function ManualPaymentForm({ onRecorded }: { onRecorded?: () => void }) {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<LoanSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchLoans = async (q: string) => {
    if (q.trim().length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setSearching(true);
    try {
      const res = await apiRequest<{ data: LoanSearchResult[]; total: number; limit: number; offset: number }>(`/loans?search=${encodeURIComponent(q.trim())}&status=active`, { admin: true });
      setSearchResults(res.data);
      setShowDropdown(res.data.length > 0);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectLoan = (loan: LoanSearchResult) => {
    setLoanId(loan.id);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!loanId.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Введите ID займа и корректную сумму');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiRequest<{ id: string; amount: number; date: string }>(
        `/loans/${loanId.trim()}/payments`,
        { method: 'POST', admin: true, body: { amount: parsedAmount } },
      );
      setSuccess(`Платёж ${res.amount.toLocaleString('ru-RU')} € зафиксирован`);
      setLoanId('');
      setAmount('');
      onRecorded?.();
      dispatchNotificationChange();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setError(msg ?? 'Ошибка при фиксации платежа');
      } else {
        setError('Ошибка при фиксации платежа');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1">ID займа</label>
          <div className="relative">
            <input
              type="text"
              value={loanId}
              onChange={(e) => {
                setLoanId(e.target.value);
                searchLoans(e.target.value);
              }}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              placeholder="UUID или имя клиента..."
              className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm min-h-[44px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none ${loanId ? 'pr-9' : ''}`}
            />
            {searching ? (
              <span className="absolute right-2 top-1/2 -translate-y-1/2"><Spinner size="sm" /></span>
            ) : (
              loanId && (
                <button
                  type="button"
                  onClick={() => { setLoanId(''); setSearchResults([]); setShowDropdown(false); }}
                  aria-label="Очистить"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )
            )}
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((loan) => (
                <button
                  key={loan.id}
                  type="button"
                  onClick={() => selectLoan(loan)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <span className="font-medium text-slate-900">{loan.user.name ?? '—'}</span>
                  <span className="text-slate-500 ml-2">{loan.user.phone}</span>
                  <span className="text-slate-400 ml-2 font-mono text-xs">#{loan.id.slice(0, 8)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Сумма, €</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm min-h-[44px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            Зафиксировать
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
    </form>
  );
}
