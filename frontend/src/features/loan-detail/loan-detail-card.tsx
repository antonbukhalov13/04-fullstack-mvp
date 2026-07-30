'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { dispatchNotificationChange } from '@/shared/lib/notification-events';

interface ScheduleItem {
  id: string;
  dueDate: string;
  amount: number;
  status: string;
}

interface PaymentRequest {
  id: string;
  amount: number;
  reference: string;
  status: string;
  createdAt: string;
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
  paymentRequests: PaymentRequest[];
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

const RESEND_COOLDOWN_SEC = 60;

function useCountdown(expiresAt: Date | null) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt) { setRemaining(0); return; }

    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemaining(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const min = String(Math.floor(remaining / 60)).padStart(2, '0');
  const sec = String(remaining % 60).padStart(2, '0');
  return { remaining, formatted: `${min}:${sec}`, expired: remaining <= 0 };
}

export function LoanDetailCard() {
  const params = useParams();
  const loanId = (params?.id ?? '') as string;
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sign flow
  const [signState, setSignState] = useState<'idle' | 'otp_sent' | 'confirming' | 'done'>('idle');
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [signError, setSignError] = useState<string | null>(null);
  const [signLoading, setSignLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { formatted, expired } = useCountdown(expiresAt);

  // Contract viewer
  const [showContract, setShowContract] = useState(false);

  useEffect(() => {
    if (showContract) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showContract]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [resendCooldown]);

  // Payment request form
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const fetchLoan = async () => {
    const data = await apiRequest<LoanDetail>(`/loans/${loanId}`);
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

  const requestOtp = async () => {
    setSignLoading(true);
    setSignError(null);
    try {
      const res = await apiRequest<{ message: string; mockOtp: string; expiresAt: string }>(
        `/loans/${loanId}/request-sign-otp`,
        { method: 'POST' },
      );
      setMockOtp(res.mockOtp);
      setExpiresAt(new Date(res.expiresAt));
      setResendCooldown(RESEND_COOLDOWN_SEC);
      setSignState('otp_sent');
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setSignError(msg ?? 'Не удалось отправить код');
      } else {
        setSignError('Не удалось отправить код');
      }
    } finally {
      setSignLoading(false);
    }
  };

  const resendOtp = async () => {
    await requestOtp();
    setOtpCode('');
  };

  const confirmSign = async () => {
    if (otpCode.length !== 6) return;
    setSignLoading(true);
    setSignError(null);
    try {
      await apiRequest(`/loans/${loanId}/confirm-sign`, {
        method: 'POST',
        body: { code: otpCode },
      });
      setSignState('done');
      setMockOtp(null);
      await fetchLoan();
      dispatchNotificationChange();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setSignError(msg ?? 'Неверный код');
      } else {
        setSignError('Неверный код');
      }
    } finally {
      setSignLoading(false);
    }
  };

  const submitPaymentRequest = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0 || !payRef.trim()) return;
    setPayLoading(true);
    setPayError(null);
    setPaySuccess(false);
    try {
      await apiRequest(`/loans/${loanId}/payment-requests`, {
        method: 'POST',
        body: { amount, reference: payRef.trim() },
      });
      setPaySuccess(true);
      setPayAmount('');
      setPayRef('');
      await fetchLoan();
      dispatchNotificationChange();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setPayError(msg ?? 'Не удалось создать заявку');
      } else {
        setPayError('Не удалось создать заявку');
      }
    } finally {
      setPayLoading(false);
    }
  };

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
      <Link href="/dashboard/loans" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Мои займы
      </Link>

      {/* Карточка займа */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Заём №{loan.id.slice(0, 8)}</h2>
          <StatusBadge status={loan.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6 text-sm text-slate-600">
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

        {/* Signing section */}
        {loan.status === 'pending_signature' && signState !== 'done' && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Подписание договора</h4>
            <p className="text-sm text-amber-700 mb-3">
              Для активации займа необходимо подтвердить подписание кодом из SMS.
            </p>

            {signState === 'idle' && (
              <Button
                onClick={requestOtp}
                disabled={signLoading}
              >
                {signLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Запросить код подписания
              </Button>
            )}

            {signState === 'otp_sent' && (
              <div className="space-y-3">
                {mockOtp && (
                  <p className="text-xs text-amber-600">
                    Mock-код для тестирования: <span className="font-mono font-bold">{mockOtp}</span>
                  </p>
                )}
                {!expired ? (
                  <p className="text-xs text-slate-500">
                    Код действителен ещё{' '}
                    <span className="font-medium text-slate-700">{formatted}</span>
                  </p>
                ) : (
                  <p className="text-xs text-red-600">Код истёк</p>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Введите 6-значный код"
                    className="w-full sm:w-44 rounded-lg border border-slate-300 px-3 py-2.5 text-sm min-h-[44px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <Button
                    onClick={confirmSign}
                    disabled={otpCode.length !== 6 || signLoading}
                    className="bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                  >
                    {signLoading ? <Spinner size="sm" className="mr-2" /> : null}
                    Подтвердить
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={resendCooldown > 0}
                    onClick={resendOtp}
                  >
                    {resendCooldown > 0
                      ? `Отправить код повторно (${resendCooldown} сек)`
                      : 'Отправить код повторно'}
                  </Button>
                </div>
              </div>
            )}

            {signError && (
              <p className="mt-2 text-sm text-red-600">{signError}</p>
            )}
          </div>
        )}

        {signState === 'done' && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700 font-medium">
              Займ успешно подписан! Статус обновлён.
            </p>
          </div>
        )}
      </div>

      {/* Contract viewer */}
      {loan.status !== 'pending_signature' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Договор</h3>
          <p className="text-sm text-slate-600 mb-3">
            Ознакомьтесь с условиями договора займа.
          </p>
          <Button
            variant="secondary"
            onClick={() => setShowContract(true)}
          >
            Просмотреть договор
          </Button>
        </div>
      )}

      {/* Contract modal */}
      {showContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowContract(false)}>
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowContract(false)}
              className="absolute top-3 right-3 p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
            <div className="border-b border-slate-200 pb-4 mb-4">
              <p className="text-xs text-amber-600 font-medium mb-1">
                ⚠ Образец документа — не является юридически обязывающим
              </p>
              <h2 className="text-xl font-bold text-slate-900">Договор займа</h2>
            </div>
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p><strong>1. Стороны</strong></p>
              <p>Заимодавец: LumenBridge Finance Ltd (далее — «Компания»).</p>
              <p>Заёмщик: физическое лицо, идентифицированное по номеру телефона, указанному при подаче заявки.</p>

              <p><strong>2. Предмет договора</strong></p>
              <p>
                Компация предоставляет Заёмщику денежные средства в размере{' '}
                <strong>{fmt(loan.amount)}</strong> EUR сроком на <strong>{loan.termDays} календарных дней</strong>{' '}
                с даты подписания настоящего договора.
              </p>

              <p><strong>3. Процентная ставка</strong></p>
              <p>
                Процентная ставка составляет <strong>{dailyRatePercent(loan.dailyRate)} в день</strong> от
                суммы основного долга. Общая сумма к возврату:{' '}
                <strong>{fmt(loan.totalRepay)} EUR</strong>.
              </p>

              <p><strong>4. Порядок возврата</strong></p>
              <p>
                Возврат осуществляется ежедневными аннуитетными платежами в соответствии
                с графиком платежей, являющимся приложением к настоящему договору.
                Каждый платёж включает сумму основного долга и проценты.
              </p>

              <p><strong>5. Просрочка</strong></p>
              <p>
                В случае просрочки платежа Компания вправе начислить штраф в размере,
                предусмотренном текущими тарифами. Заёмщик уведомлён о последствиях
                просрочки при подписании договора.
              </p>

              <p><strong>6. Заключительные положения</strong></p>
              <p>
                Настоящий договор вступает в силу с момента подписания и действует
                до полного возврата суммы займа и процентов. Споры разрешаются
                в соответствии с применимым законодательством.
              </p>

              <div className="mt-6 rounded bg-slate-50 p-3 text-xs text-slate-500">
                <p>Документ сформирован автоматически. Подпись фиксируется электронным образом.</p>
                <p className="mt-1">Заём №{loan.id.slice(0, 8)} · {fmtDate(loan.signedAt ?? loan.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment request form */}
      {loan.status === 'active' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Заявка на оплату</h3>

          {loan.paymentRequests.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Текущие заявки
              </p>
              <div className="space-y-2">
                {loan.paymentRequests.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-700">
                      {fmt(pr.amount)} · {pr.reference}
                    </span>
                    <StatusBadge status={pr.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Сумма, €</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm min-h-[44px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Назначение платежа</label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="Например: перевод с карты за 1-ый день"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm min-h-[44px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {payError && <p className="mt-2 text-sm text-red-600">{payError}</p>}
          {paySuccess && (
            <p className="mt-2 text-sm text-green-600">Заявка на оплату создана.</p>
          )}

          <div className="mt-4">
            <Button
              onClick={submitPaymentRequest}
              disabled={!payAmount || parseFloat(payAmount) <= 0 || !payRef.trim() || payLoading}
            >
              {payLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Отправить заявку
            </Button>
          </div>
        </div>
      )}

      {/* График платежей */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">График платежей</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
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
