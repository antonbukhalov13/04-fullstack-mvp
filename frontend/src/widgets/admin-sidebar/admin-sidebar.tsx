'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAdminAuthToken } from '@/shared/api';

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
  { href: '/admin/notifications', label: 'Уведомления', roles: ['admin', 'operator'] },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAdminAuthToken() ?? localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    const raw = localStorage.getItem('admin_user');
    if (raw) {
      try {
        setAdmin(JSON.parse(raw));
      } catch { /* ignore */ }
    }
    setAuthorized(true);
  }, [router]);

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
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-slate-50 min-h-full flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {visibleItems.map((item) => {
          const active = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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

      <div className="p-4 border-t border-slate-200">
        {admin && (
          <div className="mb-3">
            <p className="text-xs text-slate-400">Вы вошли как</p>
            <p className="text-sm font-medium text-slate-700">
              {admin.login}
              <span className="ml-1 text-xs text-slate-400">({admin.role})</span>
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
