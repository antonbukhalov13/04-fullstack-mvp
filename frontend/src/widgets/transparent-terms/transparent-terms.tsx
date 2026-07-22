const points = [
  {
    title: 'Никаких скрытых комиссий',
    description: 'Полная стоимость займа известна до оформления',
  },
  {
    title: 'Быстрое рассмотрение',
    description: 'Заявки обрабатываются в течение нескольких минут',
  },
  {
    title: 'Безопасность данных',
    description: 'Ваши данные защищены современными технологиями',
  },
  {
    title: 'Гибкое погашение',
    description: 'Выбирайте удобный срок и погашайте без лишнего давления',
  },
  {
    title: 'Улучшение условий со временем',
    description:
      'При повторных займах могут быть доступны более выгодные параметры и увеличенный лимит',
  },
];

export function TransparentTerms() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
          Вы заранее знаете все условия
        </h2>

        <div className="mt-10 mx-auto max-w-3xl space-y-4">
          {points.map((point) => (
            <div
              key={point.title}
              className="flex items-start gap-4 rounded-xl bg-white border border-slate-200 p-5"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
