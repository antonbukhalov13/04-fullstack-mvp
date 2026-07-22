import Link from 'next/link';

const columns = [
  {
    title: 'Компания',
    links: [
      { href: '/about', label: 'О компании' },
      { href: '/how-it-works', label: 'Как это работает' },
      { href: '/business', label: 'Для бизнеса' },
    ],
  },
  {
    title: 'Поддержка',
    links: [
      { href: '/faq', label: 'Часто задаваемые вопросы' },
      { href: '/contacts', label: 'Обратная связь' },
      { href: '/contacts', label: 'Контакты' },
    ],
  },
  {
    title: 'Документы',
    links: [
      { href: '/terms', label: 'Условия использования' },
      { href: '/privacy', label: 'Политика конфиденциальности' },
      { href: '/cookie-policy', label: 'Cookie Policy' },
      { href: '/credit-policy', label: 'Credit Policy' },
      { href: '/aml-kyc', label: 'AML/KYC Policy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-lg font-bold text-indigo-600">
              LumenBridge
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              Простые и прозрачные займы для частных лиц и бизнеса в Европе.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-slate-500">
              <p>18 Lower Baggot Street, Dublin 2, Ireland</p>
              <p>support@lumenbridge.example &middot; +353 1 531 8420</p>
            </div>
            <div className="text-xs text-slate-400">
              <p>
                LumenBridge Finance Ltd осуществляет деятельность в соответствии с применимым
                европейским законодательством. Обработка персональных данных осуществляется в
                рамках требований GDPR.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} LumenBridge Finance Ltd. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
