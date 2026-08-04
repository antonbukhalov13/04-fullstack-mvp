import type { Metadata } from 'next';
import Link from 'next/link';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Для бизнеса',
};

const whenRelevant = [
  'Временный кассовый разрыв',
  'Закупка товаров или материалов',
  'Покрытие операционных расходов',
  'Запуск или расширение бизнеса',
];

const conditions = [
  { label: 'Сумма займа', value: 'от 30,000 до 500,000 EUR' },
  { label: 'Срок', value: 'от 1 до 12 месяцев' },
  { label: 'Формат', value: 'краткосрочное финансирование' },
  { label: 'Залог', value: 'не требуется (в стандартных случаях)' },
];

const advantages = [
  {
    title: 'Быстрый доступ к средствам',
    description:
      'Решение принимается в короткие сроки, что позволяет оперативно закрывать финансовые задачи',
  },
  {
    title: 'Простая процедура',
    description:
      'Минимальный пакет документов и понятный процесс подачи заявки',
  },
  {
    title: 'Прозрачные условия',
    description:
      'Все параметры займа согласовываются заранее, без скрытых платежей',
  },
  {
    title: 'Поддержка бизнеса',
    description:
      'Финансирование адаптировано под потребности малого и среднего бизнеса',
  },
];

const docsCompanies = [
  'Certificate of Incorporation',
  'Регистрационный номер компании',
  'Удостоверение личности директора или уполномоченного лица',
  'Банковская выписка за последние месяцы',
];

const docsSole = [
  'Сертификат регистрации бизнеса',
  'Регистрационный номер предпринимателя',
  'Удостоверение личности владельца',
  'Выписка по банковскому счёту',
];

export default function BusinessPage() {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Займы для бизнеса в Европе
            </h1>
            <div className="mt-4 text-base text-slate-600 leading-relaxed space-y-3">
              <p>
                Компания предлагает краткосрочные финансовые решения для
                предпринимателей и компаний, которым важно быстро получить доступ к
                средствам.
              </p>
              <p>
                Финансирование может использоваться для покрытия текущих расходов,
                поддержания оборотного капитала или решения операционных задач.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="mt-12 text-xl font-semibold text-slate-900">
              Когда это актуально
            </h2>
            <ul className="mt-4 space-y-2">
              {whenRelevant.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="mt-12 text-xl font-semibold text-slate-900">
              Условия финансирования
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {conditions.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <dt className="text-xs text-slate-500">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {item.value}
                  </dd>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Итоговые условия определяются индивидуально после рассмотрения заявки
              и предоставленных документов.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="mt-12 text-xl font-semibold text-slate-900">
              Преимущества
            </h2>
            <div className="mt-4 space-y-4">
              {advantages.map((item) => (
                <div key={item.title}>
                  <h3 className="text-base font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="mt-12 text-xl font-semibold text-slate-900">
              Требования к заемщикам
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              Финансирование доступно для зарегистрированных европейских компаний и
              предпринимателей.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Для компаний (PVT, LTD)
                </h3>
                <ul className="mt-3 space-y-2">
                  {docsCompanies.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Для индивидуальных предпринимателей
                </h3>
                <ul className="mt-3 space-y-2">
                  {docsSole.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="mt-12 text-xl font-semibold text-slate-900">
              Порядок оформления
            </h2>
            <div className="mt-4 text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                На текущем этапе заявки на финансирование для бизнеса принимаются
                через форму обратной связи.
              </p>
              <p>
                После получения заявки с вами свяжется специалист для уточнения
                деталей и дальнейшего оформления.
              </p>
              <p>
                Онлайн-кабинет для бизнеса находится в разработке и будет доступен
                позже.
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
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="mt-12 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-semibold text-slate-900">Заключение</h2>
              <div className="mt-4 text-sm text-slate-600 leading-relaxed space-y-3">
                <p>
                  Мы понимаем, что бизнесу важны скорость, предсказуемость и
                  понятные условия.
                </p>
                <p>
                  Компания предоставляет решения, которые позволяют
                  сосредоточиться на развитии, не отвлекаясь на сложные финансовые
                  процессы.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
