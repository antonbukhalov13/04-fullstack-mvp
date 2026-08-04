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
    <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
          Часто задаваемые вопросы
        </h2>

        <div className="mt-10 mx-auto max-w-3xl space-y-4">
          {questions.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-slate-800 bg-white/5 p-5"
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
