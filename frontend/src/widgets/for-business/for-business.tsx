import Link from 'next/link';

const advantages = [
  'Займы от 30,000 до 500,000 EUR',
  'Срок: от 1 до 12 месяцев',
  'Без залога',
  'Быстрое рассмотрение',
  'Подходит для малого и среднего бизнеса',
];

export function ForBusiness() {
  return (
    <section className="bg-[#f1f5f9] py-24 sm:py-28">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Для бизнеса
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
              Финансирование для бизнеса
            </h2>
            <p className="mt-4 text-slate-500">
              Решения для компаний и предпринимателей, которым важна скорость и
              предсказуемость.
            </p>
          </div>

          <div className="lg:col-span-8 border-l-4 border-indigo-600 pl-6 sm:pl-8">
            <ul className="space-y-3">
              {advantages.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-slate-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <svg
                      className="h-3 w-3"
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
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                На данный момент заявки принимаются через форму обратной связи.
                Онлайн-кабинет для бизнеса будет доступен позже.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/apply?type=business"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Оставить заявку
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
