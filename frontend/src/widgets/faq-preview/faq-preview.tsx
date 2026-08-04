import Link from 'next/link';

const questions = [
  {
    question: 'Кто может получить займ?',
    answer:
      'Любой совершеннолетний резидент страны присутствия сервиса с действующим удостоверением личности и зарегистрированным номером телефона.',
  },
  {
    question: 'Как быстро я получу деньги?',
    answer:
      'Заявки рассматриваются в течение нескольких минут. После одобрения деньги переводятся сразу.',
  },
  {
    question: 'Есть ли скрытые комиссии?',
    answer:
      'Нет. Все условия и платежи отображаются до оформления займа.',
  },
];

export function FaqPreview() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-28">
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
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
          Часто задаваемые вопросы
        </h2>

        <div className="mt-10 mx-auto max-w-3xl space-y-4">
          {questions.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-slate-800 bg-white/5 p-5 transition-colors duration-300 hover:border-indigo-600"
            >
              <h3 className="text-base font-semibold text-slate-50">
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center min-h-[44px]"
          >
            Смотреть все вопросы →
          </Link>
        </div>
      </div>
    </section>
  );
}