const cards = [
  {
    title: 'Срочные расходы',
    description: 'Неожиданные платежи, которые нельзя перенести',
  },
  {
    title: 'Задержка дохода',
    description: 'Когда деньги нужны сейчас, а поступления позже',
  },
  {
    title: 'Бизнес-задачи',
    description: 'Кассовые разрывы или операционные расходы',
  },
  {
    title: 'Возможности',
    description: 'Ситуации, где важно действовать без промедления',
  },
];

export function WhenMoneyNeeded() {
  return (
    <section className="bg-slate-100 py-24 sm:py-28">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="w-fit">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Когда деньги нужны сейчас
          </h2>
          <div aria-hidden className="mt-4 h-[3px] rounded-full bg-indigo-600" />
        </div>
        <p className="mt-3 text-slate-500 max-w-2xl">
          Не все финансовые вопросы можно отложить. Иногда важно принять решение
          быстро — без сложных процедур и ожиданий.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 p-6 bg-white"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
