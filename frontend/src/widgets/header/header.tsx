'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api, getAuthToken, setAuthToken, AUTH_UNAUTHORIZED_EVENT } from '@/shared/api';

const navItems = [
  { href: '/how-it-works', label: 'Как это работает' },
  { href: '/business', label: 'Для бизнеса' },
  { href: '/faq', label: 'Часто задаваемые вопросы' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const token = getAuthToken() ?? localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    setAuthToken(token);
    api
      .get('/auth/me')
      .then(() => {
        if (!cancelled) setIsLoggedIn(true);
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const handleUnauthorized = () => setIsLoggedIn(false);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  if (pathname?.startsWith('/admin') || pathname === '/login') return null;

  const authHref = isLoggedIn ? '/dashboard/applications' : '/login';
  const authLabel = isLoggedIn ? 'Кабинет' : 'Войти';

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" onClick={handleLogoClick} className="flex items-start gap-2.5">
            <img src="/favicon.svg" alt="" className="h-9 w-9 mt-1" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold text-indigo-600">LumenBridge</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Finance
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-2.5 text-[13px] text-slate-600 transition-colors hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <span className="hidden lg:block h-5 w-px bg-slate-200" aria-hidden />

            <Link
              href={authHref}
              className="hidden lg:inline-flex py-2.5 text-[13px] font-bold text-slate-600 transition-colors hover:text-slate-900"
            >
              {authLabel}
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-3 text-slate-600 hover:bg-slate-100 active:bg-slate-200 min-h-[44px] min-w-[44px] transition-colors"
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
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-3 text-[13px] text-slate-600 hover:bg-slate-100 min-h-[44px] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={authHref}
              className="block rounded-lg px-3 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-100 min-h-[44px] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {authLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}