import Link from 'next/link';

const benefits = [
  'Возможность начать с небольшой суммы',
  'Формирование положительной кредитной истории',
];

export function CreditHistory() {
  return (
    <section className="bg-slate-900 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Займ — это не только деньги сейчас
          </h2>
          <p className="mt-6 text-base text-slate-400 leading-relaxed">
            Своевременное погашение займа помогает улучшить кредитный рейтинг и
            открывает доступ к более выгодным условиям в будущем.
          </p>
          <div className="mt-8 space-y-3 text-left inline-block">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-5 py-3"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
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
                <span className="text-sm text-slate-200">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/apply?type=individual"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 transition-colors hover:bg-indigo-700"
            >
              Начать с небольшого займа
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
