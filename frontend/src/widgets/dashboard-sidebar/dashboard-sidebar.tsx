'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken, setAuthToken } from '@/shared/api';

const navItems = [
  { href: '/dashboard/applications', label: 'Заявки' },
  { href: '/dashboard/loans', label: 'Мои займы' },
  { href: '/dashboard/notifications', label: 'Уведомления' },
];

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken() ?? localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setAuthToken(token);
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!authorized) return null;

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 left-5 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg active:scale-95 transition-transform"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        )}
      </button>

      {/* Overlay backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'w-56 shrink-0 border-r border-slate-200 bg-slate-50 min-h-full',
          'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:transition-none',
        ].join(' ')}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href) ?? false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
