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
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
          Как всё происходит
        </h2>
        <p className="mt-3 text-center text-slate-500 max-w-2xl mx-auto">
          Оформление займа занимает всего несколько минут и полностью проходит
          онлайн, без визитов в офис и сложных процедур.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
