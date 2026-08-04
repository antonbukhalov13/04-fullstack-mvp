'use client';

import { useState } from 'react';
import Link from 'next/link';
import { calculateAnnuity, INDIVIDUAL_LIMITS } from '@/shared/lib/calculator';

export function Calculator() {
  const [amount, setAmount] = useState(1000);
  const [termDays, setTermDays] = useState(30);

  const result = calculateAnnuity(amount, termDays);

  const amountPct =
    ((amount - INDIVIDUAL_LIMITS.amount.min) /
      (INDIVIDUAL_LIMITS.amount.max - INDIVIDUAL_LIMITS.amount.min)) *
    100;
  const termPct =
    ((termDays - INDIVIDUAL_LIMITS.term.min) /
      (INDIVIDUAL_LIMITS.term.max - INDIVIDUAL_LIMITS.term.min)) *
    100;

  const rangeStyle = (pct: number) =>
    ({ '--range-fill': `${pct}%` }) as React.CSSProperties;

  return (
    <section
      id="calculator"
      className="scroll-mt-24 bg-slate-900 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Кредитный калькулятор
          </h2>
          <p className="mt-3 text-slate-400">
            Рассчитайте условия займа за несколько секунд — выберите сумму и срок,
            чтобы сразу увидеть итоговую сумму к возврату. Все условия отображаются
            до оформления займа.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-indigo-600 bg-slate-950/60 p-6 shadow-sm sm:p-8">
          <div className="space-y-8">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="calc-amount" className="text-sm font-medium text-slate-400">
                  Сумма (EUR)
                </label>
                <span className="text-lg font-bold text-indigo-400">
                  {amount.toLocaleString('ru-RU')} EUR
                </span>
              </div>
              <input
                id="calc-amount"
                type="range"
                min={INDIVIDUAL_LIMITS.amount.min}
                max={INDIVIDUAL_LIMITS.amount.max}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={rangeStyle(amountPct)}
                className="mt-3 w-full cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>{INDIVIDUAL_LIMITS.amount.min.toLocaleString('ru-RU')} EUR</span>
                <span>{INDIVIDUAL_LIMITS.amount.max.toLocaleString('ru-RU')} EUR</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="calc-term" className="text-sm font-medium text-slate-400">
                  Срок (дней)
                </label>
                <span className="text-lg font-bold text-indigo-400">
                  {termDays} дн.
                </span>
              </div>
              <input
                id="calc-term"
                type="range"
                min={INDIVIDUAL_LIMITS.term.min}
                max={INDIVIDUAL_LIMITS.term.max}
                step={1}
                value={termDays}
                onChange={(e) => setTermDays(Number(e.target.value))}
                style={rangeStyle(termPct)}
                className="mt-3 w-full cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>{INDIVIDUAL_LIMITS.term.min} дн.</span>
                <span>{INDIVIDUAL_LIMITS.term.max} дн.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-center">
            <p className="text-sm text-slate-400">Ежемесячный платёж</p>
            <p className="mt-1 text-3xl font-bold text-indigo-400">
              {result.payment.toLocaleString('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 })}{' '}
              EUR
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Общая сумма к возврату:{' '}
              <span className="font-medium text-slate-200">
                {result.total.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 })}{' '}
                EUR
              </span>
            </p>
          </div>

          <Link
            href="/apply"
            className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 transition-colors hover:bg-indigo-700"
          >
            Получить займ
          </Link>

          <p className="mt-4 text-center text-xs text-slate-500">
            Расчёт носит ознакомительный характер. Итоговые условия зависят от
            результатов проверки клиента.
          </p>
        </div>
      </div>
    </section>
  );
}
