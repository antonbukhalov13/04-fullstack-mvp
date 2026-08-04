export function AboutCompany() {
  return (
    <section id="about" className="py-24 sm:py-32 scroll-mt-24">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              О компании
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
              LumenBridge Finance Ltd
            </h2>
          </div>

          <div className="lg:col-span-8 border-l-4 border-indigo-600 pl-6 sm:pl-8">
            <p className="text-base text-slate-600 leading-relaxed">
              LumenBridge Finance Ltd — финансовая организация, предоставляющая
              быстрые и доступные решения в сфере кредитования в Европе.
            </p>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Наша цель — упростить доступ к финансированию за счёт прозрачных
              условий и современных технологий.
            </p>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Мы работаем в соответствии с действующим законодательством и уделяем
              особое внимание защите данных клиентов и ответственному кредитованию.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
