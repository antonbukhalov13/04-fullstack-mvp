import type { Metadata } from 'next';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Политика использования файлов cookies',
};

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
            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              1. Что такое cookies
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Cookies — это небольшие текстовые файлы, которые сохраняются на
              устройстве пользователя при посещении сайта и обеспечивают его
              корректную работу.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              2. Какие cookies мы используем
            </h2>
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

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              3. Правовое основание использования cookies
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Обязательные cookies используются для обеспечения работы сайта.
              Аналитические и функциональные cookies используются с согласия
              пользователя.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              4. Управление cookies
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Пользователь может управлять cookies через настройки браузера или
              с помощью cookie-баннера на сайте.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              5. Срок хранения cookies
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Срок хранения cookies зависит от их типа и настроек системы.
            </p>

            <h2 className="mt-10 text-xl font-semibold text-slate-900">
              6. Изменения политики cookies
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Компания оставляет за собой право вносить изменения в настоящую
              Политику. Актуальная версия всегда доступна на сайте.
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Настоящая политика действует с момента её публикации на сайте.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
