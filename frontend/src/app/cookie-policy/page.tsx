import type { Metadata } from 'next';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Политика использования файлов cookies',
};

const sections = [
  {
    title: 'Что такое cookies',
    content: (
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
        Cookies — это небольшие текстовые файлы, которые сохраняются на
        устройстве пользователя при посещении сайта и обеспечивают его
        корректную работу.
      </p>
    ),
  },
  {
    title: 'Какие cookies мы используем',
    content: (
      <>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          На сайте могут использоваться следующие категории cookies:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            обязательные cookies — необходимы для функционирования сайта;
          </li>
          <li>
            аналитические cookies — используются для анализа посещаемости и
            улучшения работы сайта;
          </li>
          <li>
            функциональные cookies — запоминают пользовательские настройки.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Правовое основание использования cookies',
    content: (
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
        Обязательные cookies используются для обеспечения работы сайта.
        Аналитические и функциональные cookies используются с согласия
        пользователя.
      </p>
    ),
  },
  {
    title: 'Управление cookies',
    content: (
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
        Пользователь может управлять cookies через настройки браузера или
        с помощью cookie-баннера на сайте.
      </p>
    ),
  },
  {
    title: 'Срок хранения cookies',
    content: (
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
        Срок хранения cookies зависит от их типа и настроек системы.
      </p>
    ),
  },
  {
    title: 'Изменения политики cookies',
    content: (
      <>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Компания оставляет за собой право вносить изменения в настоящую
          Политику. Актуальная версия всегда доступна на сайте.
        </p>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Настоящая политика действует с момента её публикации на сайте.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Политика использования файлов cookies
            </h1>
            <p className="mt-4 text-sm text-slate-500">
              Настоящая Политика использования файлов cookies объясняет, какие
              cookies используются на сайте компании LumenBridge Finance Ltd и с
              какой целью.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            {sections.map((section, i) => (
              <div key={section.title} className="mt-10 flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {section.title}
                  </h2>
                  {section.content}
                </div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
