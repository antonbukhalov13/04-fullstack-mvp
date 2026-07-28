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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
          Когда деньги нужны сейчас
        </h2>
        <p className="mt-3 text-center text-slate-500 max-w-2xl mx-auto">
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
