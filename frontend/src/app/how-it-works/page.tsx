import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Как работает сервис',
};

const steps = [
  {
    title: 'Регистрация',
    description:
      'Введите номер телефона и подтвердите его с помощью SMS-кода. После этого вы получаете доступ к личному кабинету, где можно управлять заявками и отслеживать статус займа.',
  },
  {
    title: 'Подача заявки',
    description:
      'Выберите сумму и срок займа, укажите необходимую информацию и отправьте заявку на рассмотрение. Все условия отображаются заранее.',
  },
  {
    title: 'Проверка и одобрение',
    description:
      'Заявка анализируется автоматически на основе предоставленных данных. Решение принимается в короткие сроки. При повторных обращениях могут быть доступны более выгодные условия. В некоторых случаях может потребоваться дополнительная информация.',
  },
  {
    title: 'Получение средств',
    description:
      'После одобрения деньги переводятся на указанный банковский счёт. Перевод осуществляется сразу после подтверждения условий.',
  },
  {
    title: 'Погашение',
    description:
      'Погашение осуществляется удобным для вас способом в установленный срок. Вы можете внести платеж заранее без дополнительных комиссий.',
  },
];

const importantToKnow = [
  'Все условия займа отображаются до его оформления',
  'Мы не взимаем скрытые комиссии',
  'Данные клиентов обрабатываются в соответствии с требованиями законодательства',
  'Информация о погашении учитывается во внутренней истории клиента',
];

export default function HowItWorksPage() {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Как работает сервис
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Мы сделали процесс получения займа максимально простым и понятным. Вам
            не нужно посещать офис или собирать сложный пакет документов — всё
            оформляется онлайн за несколько минут.
          </p>

          <h2 className="mt-12 text-xl font-semibold text-slate-900">
            Как проходит оформление займа
          </h2>

          <div className="mt-8 space-y-8">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-semibold text-slate-900">
            Важно знать
          </h2>
          <ul className="mt-4 space-y-2">
            {importantToKnow.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-slate-600 leading-relaxed">
            Весь процесс — от подачи заявки до получения средств — проходит
            дистанционно, что позволяет сэкономить время и получить доступ к
            финансированию тогда, когда это действительно нужно.
          </p>
        </div>
      </div>
    </main>
  );
}
