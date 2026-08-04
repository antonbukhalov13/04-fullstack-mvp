'use client';

import Link from 'next/link';

export function Hero() {
  function handleScrollToCalculator(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', '/#calculator');
  }

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-[#f1f5f9]">
      <div className="relative mx-auto max-w-[100rem] px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Получите деньги тогда, когда это{' '}
          <span className="text-indigo-600">действительно</span> нужно
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 sm:text-xl">
          Простые и прозрачные займы для частных лиц и бизнеса в Европе — быстрое
          решение и безопасное оформление
        </p>

        <div className="mx-auto mt-8 max-w-2xl border-l-2 border-indigo-600/60 pl-5 text-left">
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Неожиданные расходы или срочные возможности не должны вас
            останавливать. Сервис помогает быстро получить финансирование —
            без сложных процедур и скрытых условий.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition-colors hover:bg-indigo-700"
          >
            Получить займ
          </Link>
          <Link
            href="/#calculator"
            onClick={handleScrollToCalculator}
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400 border border-slate-300"
          >
            Рассчитать условия
          </Link>
        </div>

        <p className="mt-12 text-sm text-slate-500">
          Без залога &middot; Быстрое одобрение &middot; Выплата на банковский счёт
        </p>
      </div>
    </section>
  );
}
