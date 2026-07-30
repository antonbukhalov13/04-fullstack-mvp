'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [overflowIds, setOverflowIds] = useState<Set<string>>(new Set());
  const paraRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const setParaRef = useCallback((id: string) => (el: HTMLParagraphElement | null) => {
    paraRefs.current[id] = el;
  }, []);

  useEffect(() => {
    setOverflowIds((prev) => {
      const ids = new Set(prev);
      for (const item of items) {
        if (expanded === item.id) continue;
        const el = paraRefs.current[item.id];
        if (el && item.message.length > LONG_MSG_THRESHOLD) {
          if (el.scrollHeight > el.clientHeight + 1) {
            ids.add(item.id);
          } else {
            ids.delete(item.id);
          }
        }
      }
      return ids;
    });
  }, [items, expanded]);

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
        const exceedsThreshold = m.message.length > LONG_MSG_THRESHOLD;
        const isOpen = expanded === m.id;
        const showButton = overflowIds.has(m.id);
        return (
          <div
            key={m.id}
            className="rounded-lg border border-slate-200 bg-white text-sm overflow-hidden"
          >
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-slate-900">{m.name}</span>
                    <span className="text-xs text-slate-400">{m.phone}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{m.email}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{fmtDate(m.createdAt)}</span>
              </div>
              <p
                ref={setParaRef(m.id)}
                className={['mt-3 text-slate-700', exceedsThreshold && !isOpen ? 'line-clamp-3' : ''].join(' ')}
                style={{ overflowWrap: 'anywhere' }}
              >
                {m.message || '—'}
              </p>
              {m.attachmentUrl && (
                <a
                  href={m.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 underline hover:text-indigo-800"
                >
                  📎 {m.attachmentName ?? 'файл'}
                </a>
              )}
            </div>
            {showButton && (
              <button
                onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full border-t border-slate-200 px-4 py-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center justify-center gap-1">
                  {isOpen ? '▲ свернуть' : '▼ развернуть'}
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
