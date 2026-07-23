'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/shared/api';

const navItems = [
  { href: '/dashboard/applications', label: 'Заявки' },
  { href: '/dashboard/loans', label: 'Мои займы' },
  { href: '/dashboard/notifications', label: 'Уведомления' },
];

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAuthToken() ?? localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-slate-50 min-h-full">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
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
    </aside>
  );
}
