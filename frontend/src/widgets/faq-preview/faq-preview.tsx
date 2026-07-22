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
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
          Часто задаваемые вопросы
        </h2>

        <div className="mt-10 mx-auto max-w-3xl space-y-4">
          {questions.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-slate-200 p-5"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Смотреть все вопросы →
          </Link>
        </div>
      </div>
    </section>
  );
}
