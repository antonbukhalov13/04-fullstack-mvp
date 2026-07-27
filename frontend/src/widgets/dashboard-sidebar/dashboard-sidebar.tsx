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
  const [unreadCount, setUnreadCount] = useState(0);

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
    if (!authorized) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    fetch(`${baseUrl}/users/me/notifications`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n: { isRead?: boolean }) => !n.isRead).length);
        }
      })
      .catch(() => {});
  }, [authorized]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setAuthToken('');
    localStorage.removeItem('token');
    router.replace('/login');
  };

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
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:transition-none',
        ].join(' ')}
      >
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href) ?? false;
            const showBadge = item.href === '/dashboard/notifications' && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                <span>{item.label}</span>
                {showBadge && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
