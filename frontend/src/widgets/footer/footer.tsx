import Link from 'next/link';

const columns = [
  {
    title: 'Компания',
    links: [
      { href: '/#about', label: 'О компании' },
      { href: '/how-it-works', label: 'Как это работает' },
      { href: '/business', label: 'Для бизнеса' },
    ],
  },
  {
    title: 'Поддержка',
    links: [
      { href: '/faq', label: 'Часто задаваемые вопросы' },
      { href: '/#contact', label: 'Обратная связь' },
      { href: '/#contact-details', label: 'Контакты' },
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
    <footer className="border-t-2 border-slate-300 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 sm:gap-x-8">
          <div>
            <Link href="/" className="text-lg font-bold text-indigo-600">
              LumenBridge
            </Link>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center min-h-[36px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <a href="https://maps.google.com/?q=18+Lower+Baggot+Street+Dublin+2+Ireland" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 transition-colors">
                18 Lower Baggot Street, Dublin 2, Ireland
              </a>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <a href="mailto:support@lumenbridge.example" className="text-slate-500 hover:text-slate-700 transition-colors">
                support@lumenbridge.example
              </a>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <a href="tel:+35315318420" className="text-slate-500 hover:text-slate-700 transition-colors">
                +353 1 531 8420
              </a>
            </div>
          </div>

          <p className="mt-6 text-[13px] text-slate-400 leading-relaxed">
            LumenBridge Finance Ltd осуществляет деятельность в соответствии с применимым
            европейским законодательством. Обработка персональных данных осуществляется в
            рамках требований GDPR.
          </p>

          <p className="mt-3 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} LumenBridge Finance Ltd. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
