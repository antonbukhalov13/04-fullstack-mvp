'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, getAuthToken, setAuthToken, AUTH_UNAUTHORIZED_EVENT } from '@/shared/api';
import { NOTIFICATION_CHANGE_EVENT } from '@/shared/lib/notification-events';

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
    const handleUnauthorized = () => {
      setAuthToken('');
      router.replace('/login');
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    const fetchCount = async () => {
      try {
        const res = await api.get<{ count: number }>('/users/me/notifications/unread-count');
        setUnreadCount(res.count ?? 0);
      } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 3000);
    const handleRead = () => fetchCount();
    window.addEventListener('notification-read', handleRead);
    const handleFocus = () => fetchCount();
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => { if (!document.hidden) fetchCount(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener(NOTIFICATION_CHANGE_EVENT, fetchCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-read', handleRead);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener(NOTIFICATION_CHANGE_EVENT, fetchCount);
    };
  }, [authorized, pathname]);

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
        className="fixed bottom-5 left-5 z-[70] lg:hidden flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg active:scale-95 transition-transform"
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
          className="fixed inset-0 z-[55] bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'w-56 shrink-0 border-r border-slate-200 bg-slate-50 min-h-full',
          'fixed inset-y-0 left-0 z-[60] transition-transform duration-200 ease-in-out',
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:transition-none',
        ].join(' ')}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href) ?? false;
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
                  {item.href === '/dashboard/notifications' && (
                    <span className={[
                      'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
                      unreadCount > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-500',
                    ].join(' ')}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
