const points = [
  'Соответствие требованиям GDPR',
  'Ответственный подход к проверке заявок',
  'Защита персональных данных',
  'Чёткие и понятные условия',
];

export function TrustBlock() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-2xl text-2xl sm:text-3xl font-bold text-slate-900">
          Работаем прозрачно и в рамках закона
        </h2>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium text-slate-700">
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
