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

        <div className="mt-10 mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-white border border-slate-200 p-5"
            >
              <dt className="text-sm text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">
                {item.value}
              </dd>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Итоговые условия зависят от результатов проверки клиента и
          предоставленных данных.
        </p>
      </div>
    </section>
  );
}
