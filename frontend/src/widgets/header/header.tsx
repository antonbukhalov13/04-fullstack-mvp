'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuthToken } from '@/shared/api';

const navItems = [
  { href: '/how-it-works', label: 'Как это работает' },
  { href: '/business', label: 'Для бизнеса' },
  { href: '/faq', label: 'FAQ' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoggedIn(!!(getAuthToken() ?? localStorage.getItem('token')));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-indigo-600">LumenBridge</span>
            <span className="text-sm font-semibold text-slate-600">Finance</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
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
              className="inline-flex items-center justify-center rounded-lg border border-indigo-600 px-6 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white min-h-[44px]"
            >
              Получить займ
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard/applications"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300 hover:text-slate-900 hover:border-slate-300 active:bg-slate-400 transition-colors min-h-[44px]"
              >
                Кабинет
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300 hover:text-slate-900 hover:border-slate-300 active:bg-slate-400 transition-colors min-h-[44px]"
              >
                Войти
              </Link>
            )}
          </nav>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-3 text-slate-600 hover:bg-slate-100 active:bg-slate-200 min-h-[44px] min-w-[44px]"
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
        <div className="lg:hidden border-t border-slate-200 bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-100 min-h-[44px]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/apply"
              className="block rounded-lg border border-indigo-600 px-6 py-3 text-center text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white min-h-[44px]"
              onClick={() => setMobileOpen(false)}
            >
              Получить займ
            </Link>
            {isLoggedIn ? (
              <Link
                href="/dashboard/applications"
                className="block rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300 hover:text-slate-900 hover:border-slate-300 active:bg-slate-400 min-h-[44px]"
                onClick={() => setMobileOpen(false)}
              >
                Кабинет
              </Link>
            ) : (
              <Link
                href="/login"
                className="block rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300 hover:text-slate-900 hover:border-slate-300 active:bg-slate-400 min-h-[44px]"
                onClick={() => setMobileOpen(false)}
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
