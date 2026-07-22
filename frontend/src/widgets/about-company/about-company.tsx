import Link from 'next/link';

export function AboutCompany() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            О LumenBridge Finance Ltd
          </h2>
          <p className="mt-6 text-base text-slate-600 leading-relaxed">
            LumenBridge Finance Ltd — финансовая организация, предоставляющая
            быстрые и доступные решения в сфере кредитования в Европе. Наша цель —
            упростить доступ к финансированию за счёт прозрачных условий и
            современных технологий. Мы работаем в соответствии с действующим
            законодательством и уделяем особое внимание защите данных клиентов и
            ответственному кредитованию.
          </p>
          <Link
            href="/apply?type=individual"
            className="mt-8 inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Начать с небольшого займа
          </Link>
        </div>
      </div>
    </section>
  );
}
