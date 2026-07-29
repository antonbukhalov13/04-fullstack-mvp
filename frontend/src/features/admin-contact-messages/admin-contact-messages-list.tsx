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

const LONG_MSG_THRESHOLD = 150;

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
        const isLong = m.message.length > LONG_MSG_THRESHOLD;
        const isOpen = expanded === m.id;
        return (
          <div
            key={m.id}
            className={[
              'rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm',
              isLong ? 'cursor-pointer transition-colors hover:bg-slate-50' : '',
            ].join(' ')}
            onClick={isLong ? () => setExpanded(isOpen ? null : m.id) : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-slate-900">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.phone}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
                <p className={['mt-1 text-slate-700 break-words', isLong && !isOpen ? 'line-clamp-3' : ''].join(' ')}>
                  {m.message || '—'}
                </p>
                {isLong && !isOpen && (
                  <span className="mt-0.5 inline-flex text-xs text-indigo-600">развернуть</span>
                )}
                {m.attachmentUrl && (
                  <a
                    href={m.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 underline hover:text-indigo-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📎 {m.attachmentName ?? 'файл'}
                  </a>
                )}
              </div>
              <span className="text-xs text-slate-400 shrink-0">{fmtDate(m.createdAt)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
