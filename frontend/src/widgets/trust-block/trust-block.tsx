const points = [
  'Соответствие требованиям GDPR',
  'Ответственный подход к проверке заявок',
  'Защита персональных данных',
  'Чёткие и понятные условия',
];

export function TrustBlock() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Работаем прозрачно и в рамках закона
        </h2>

        <div className="mt-10 mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {points.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
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
