'use client';

import { useState } from 'react';
import { apiRequest, ApiError } from '@/shared/api';
import { Spinner } from '@/shared/ui';

export function ManualPaymentForm({ onRecorded }: { onRecorded?: () => void }) {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ID займа</label>
          <input
            type="text"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder="UUID займа"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            Зафиксировать
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
    </form>
  );
}
