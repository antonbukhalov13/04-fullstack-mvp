'use client';

import Link from 'next/link';

export function Hero() {
  function handleScrollToCalculator(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document
      .getElementById('calculator')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.history.replaceState(null, '', '/#calculator');
  }

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(123,104,238,0.28),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(49,46,129,0.45),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="relative mx-auto max-w-[100rem] px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Получите деньги тогда, когда это{' '}
          <span className="text-indigo-400">действительно</span> нужно
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400 sm:text-xl">
          Простые и прозрачные займы для частных лиц и бизнеса в Европе — быстрое
          решение и безопасное оформление
        </p>

        <div className="mx-auto mt-8 max-w-2xl border-l-2 border-indigo-500/40 pl-5 text-left">
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Неожиданные расходы или срочные возможности не должны вас
            останавливать. Сервис помогает быстро получить финансирование —
            без сложных процедур и скрытых условий.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 transition-colors hover:bg-indigo-700"
          >
            Получить займ
          </Link>
          <Link
            href="/#calculator"
            onClick={handleScrollToCalculator}
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-800 hover:text-white active:bg-slate-700 border border-slate-700"
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
