'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAdminAuthToken, setAdminAuthToken } from '@/shared/api';

interface AdminUser {
  id: string;
  login: string;
  role: string;
}

const navItems = [
  { href: '/admin/applications', label: 'Заявки', roles: ['admin', 'operator'] },
  { href: '/admin/clients', label: 'Клиенты', roles: ['admin', 'operator'] },
  { href: '/admin/loans', label: 'Займы', roles: ['admin', 'operator'] },
  { href: '/admin/payments', label: 'Платежи', roles: ['admin', 'operator'] },
  { href: '/admin/contact-messages', label: 'Сообщения', roles: ['admin', 'operator'] },
  { href: '/admin/notifications', label: 'Уведомления', roles: ['admin', 'operator'] },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = getAdminAuthToken() ?? localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setAdminAuthToken(token);
    const raw = localStorage.getItem('admin_user');
    if (raw) {
      try {
        setAdmin(JSON.parse(raw));
      } catch { /* ignore */ }
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!authorized) return;
    const fetchCount = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
        const token = getAdminAuthToken();
        if (!token) return;
        const res = await fetch(`${baseUrl}/admin/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count ?? 0);
        }
      } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    const handleRead = () => fetchCount();
    window.addEventListener('notification-read', handleRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-read', handleRead);
    };
  }, [authorized]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.replace('/admin/login');
  };

  if (!authorized) return null;

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(admin?.role ?? ''),
  );

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
          'w-56 shrink-0 border-r border-slate-200 bg-slate-50 min-h-full flex flex-col',
          'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:transition-none',
        ].join(' ')}
      >
        {admin && (
          <div className="p-4 border-b border-slate-200">
            <p className="text-xs text-slate-400">Вы вошли как</p>
            <p className="text-sm font-medium text-slate-700">
              {admin.login}
              <span className="ml-1 text-xs text-slate-400">({admin.role})</span>
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          <nav className="p-4 space-y-1 overflow-y-auto">
            {visibleItems.map((item) => {
              const active = pathname?.startsWith(item.href) ?? false;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')}
                >
                  <span>{item.label}</span>
                  {item.href === '/admin/notifications' && (
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
