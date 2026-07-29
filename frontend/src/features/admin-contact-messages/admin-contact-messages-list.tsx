'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/shared/api';
import { Spinner } from '@/shared/ui';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  attachmentId: string | null;
  createdAt: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminContactMessagesList() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{ data: ContactMessage[]; total: number; limit: number; offset: number }>('/admin/contact-messages', { admin: true });
        if (!cancelled) setItems(res.data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown>;
            const msg = Array.isArray(body?.message)
              ? body.message[0]
              : typeof body?.message === 'string'
                ? body.message
                : null;
            setError(msg ?? 'Не удалось загрузить сообщения');
          } else {
            setError('Не удалось загрузить сообщения');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Сообщений пока нет.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((m) => {
        const isOpen = expanded === m.id;
        return (
          <div
            key={m.id}
            className="rounded-lg border border-slate-200 bg-white"
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : m.id)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-slate-900">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.phone}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
                {!isOpen && (
                  <p className="mt-1 text-slate-600 line-clamp-1">{m.message}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-slate-400">{fmtDate(m.createdAt)}</span>
                {m.attachmentUrl && (
                  <a
                    href={m.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 underline hover:text-indigo-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📎 {m.attachmentName ?? 'файл'}
                  </a>
                )}
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-3 text-sm text-slate-700 break-words border-t border-slate-100">
                {m.message || '—'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
