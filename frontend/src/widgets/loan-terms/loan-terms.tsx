export function LoanTerms() {
  const items = [
    { label: 'Сумма', value: 'от 500 до 50 000 EUR' },
    { label: 'Срок', value: 'от 7 до 90 дней' },
    { label: 'Процентная ставка', value: 'определяется индивидуально' },
    { label: 'Погашение', value: 'равными платежами' },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
          Основные условия
        </h2>

        <div className="relative mt-12 mx-auto max-w-3xl">
          {/* Central vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-indigo-200 -translate-x-1/2" />

          <div className="space-y-10">
            {items.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={item.label} className="relative min-h-[72px]">
                  {/* Dot on center line */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-slate-50" />

                  {isLeft ? (
                    <div className="flex items-center">
                      <div className="w-[calc(50%-1.5rem)] text-right pr-2">
                        <dt className="text-sm text-slate-500">{item.label}</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-900">{item.value}</dd>
                      </div>
                      <div className="w-6 h-px bg-indigo-200 shrink-0" />
                      <div className="flex-1" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex-1" />
                      <div className="w-6 h-px bg-indigo-200 shrink-0" />
                      <div className="w-[calc(50%-1.5rem)] pl-2">
                        <dt className="text-sm text-slate-500">{item.label}</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-900">{item.value}</dd>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-slate-400">
          Итоговые условия зависят от результатов проверки клиента и
          предоставленных данных.
        </p>
      </div>
    </section>
  );
}
