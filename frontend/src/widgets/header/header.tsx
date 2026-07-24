'use client';

import { useState } from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/how-it-works', label: 'Как это работает' },
  { href: '/business', label: 'Для бизнеса' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contacts', label: 'Обратная связь' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1.5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-xl font-bold text-indigo-600">LumenBridge</span>
            <span className="hidden sm:inline text-sm font-semibold text-slate-600 pb-0.5">Finance</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors py-2.5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/apply"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors min-h-[44px]"
            >
              Получить займ
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2.5 text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Меню"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/apply"
              className="block rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700 min-h-[44px]"
              onClick={() => setMobileOpen(false)}
            >
              Получить займ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
