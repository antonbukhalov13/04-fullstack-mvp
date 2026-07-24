import Link from 'next/link';

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-indigo-50 to-slate-50 py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
          Получите деньги тогда, когда это действительно нужно
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Простые и прозрачные займы для частных лиц и бизнеса в Европе — быстрое
          решение и безопасное оформление
        </p>

        <p className="mt-4 text-base text-slate-500 max-w-2xl mx-auto">
          Неожиданные расходы или срочные возможности не должны вас останавливать.
          Сервис помогает быстро получить финансирование — без сложных процедур и
          скрытых условий.
        </p>

        <div className="mt-8">
          <Link
            href="/apply"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Получить займ
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Без залога &middot; Быстрое одобрение &middot; Выплата на банковский счёт
        </p>
      </div>
    </section>
  );
}
