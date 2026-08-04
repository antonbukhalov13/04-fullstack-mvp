export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Регистрация',
      description:
        'Введите номер телефона и подтвердите его с помощью SMS-кода.',
    },
    {
      number: '2',
      title: 'Заявка',
      description:
        'Выберите сумму и срок займа и отправьте заявку на рассмотрение.',
    },
    {
      number: '3',
      title: 'Получение средств',
      description:
        'После одобрения деньги поступают на ваш банковский счёт.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(123,104,238,0.28),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(49,46,129,0.45),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="relative mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Как всё происходит
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl">
          Оформление займа занимает всего несколько минут и полностью проходит
          онлайн, без визитов в офис и сложных процедур.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
