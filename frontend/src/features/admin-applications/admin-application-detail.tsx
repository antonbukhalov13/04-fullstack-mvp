'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/shared/api';
import { StatusBadge, Spinner } from '@/shared/ui';
import { Button } from '@/shared/ui/button';

interface ApplicationDetail {
  id: string;
  applicantType: string;
  amount: number;
  termDays: number;
  status: string;
  comment: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  companyName: string | null;
  registrationNumber: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  createdAt: string;
  user: { id: string; phone: string };
}

const statusLabels: Record<string, string> = {
  new: 'На рассмотрении',
  in_progress: 'В обработке',
  approved: 'Одобрена',
  rejected: 'Отклонена',
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' €';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function AdminApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const appId = (params?.id ?? '') as string;

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchApp = async () => {
    const data = await apiRequest<ApplicationDetail>(`/applications/${appId}`, { admin: true });
    setApp(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchApp();
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            const body = err.body as Record<string, unknown>;
            const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
            setError(msg ?? 'Не удалось загрузить заявку');
          } else {
            setError('Не удалось загрузить заявку');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [appId]);

  const updateStatus = async () => {
    if (!newStatus) return;
    if (newStatus === 'rejected' && !window.confirm('Отклонить заявку? Это действие необратимо.')) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/applications/${appId}/status`, {
        method: 'PATCH',
        admin: true,
        body: { status: newStatus, comment: comment.trim() || undefined },
      });
      setActionSuccess(`Статус изменён на «${statusLabels[newStatus] ?? newStatus}»`);
      setNewStatus('');
      setComment('');
      await fetchApp();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setActionError(msg ?? 'Ошибка при изменении статуса');
      } else {
        setActionError('Ошибка при изменении статуса');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/applications/${appId}/comments`, {
        method: 'POST',
        admin: true,
        body: { comment: comment.trim() },
      });
      setActionSuccess('Комментарий добавлен');
      setComment('');
      await fetchApp();
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as Record<string, unknown>;
        const msg = Array.isArray(body?.message) ? body.message[0] : typeof body?.message === 'string' ? body.message : null;
        setActionError(msg ?? 'Ошибка при добавлении комментария');
      } else {
        setActionError('Ошибка при добавлении комментария');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
        <div className="mt-3">
          <Link href="/admin/applications" className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>К списку</Link>
        </div>
      </div>
    );
  }

  if (!app) return null;

  const isIndividual = app.applicantType === 'individual';

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Заявки
      </Link>

      {/* Данные заявки */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Заявка №{app.id.slice(0, 8)}
          </h2>
          <StatusBadge status={app.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Тип</p>
            <p className="font-medium text-slate-900">{isIndividual ? 'Физлицо' : 'Бизнес'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Сумма</p>
            <p className="font-medium text-slate-900">{fmt(app.amount)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Срок</p>
            <p className="font-medium text-slate-900">{app.termDays} дн.</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Телефон</p>
            <p className="font-medium text-slate-900">{app.user.phone}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Дата подачи</p>
            <p className="font-medium text-slate-900">{fmtDate(app.createdAt)}</p>
          </div>
          {isIndividual ? (
            <>
              <div>
                <p className="text-slate-500 mb-1">Имя</p>
                <p className="font-medium text-slate-900">{[app.firstName, app.lastName].filter(Boolean).join(' ') || '—'}</p>
              </div>
              {app.email && (
                <div>
                  <p className="text-slate-500 mb-1">Email</p>
                  <p className="font-medium text-slate-900">{app.email}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="text-slate-500 mb-1">Компания</p>
                <p className="font-medium text-slate-900">{app.companyName ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Рег. номер</p>
                <p className="font-medium text-slate-900">{app.registrationNumber ?? '—'}</p>
              </div>
              {app.companyEmail && (
                <div>
                  <p className="text-slate-500 mb-1">Email компании</p>
                  <p className="font-medium text-slate-900">{app.companyEmail}</p>
                </div>
              )}
              {app.companyPhone && (
                <div>
                  <p className="text-slate-500 mb-1">Тел. компании</p>
                  <p className="font-medium text-slate-900">{app.companyPhone}</p>
                </div>
              )}
            </>
          )}
        </div>

        {app.comment && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Комментарий</p>
            <p className="text-slate-700">{app.comment}</p>
          </div>
        )}
      </div>

      {/* Действия */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Действия</h3>

        <div className="space-y-4">
          {/* Смена статуса */}
          {app.status !== 'approved' && app.status !== 'rejected' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Изменить статус</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Выберите статус</option>
                  {app.status === 'new' && <option value="in_progress">В обработке</option>}
                  {app.status === 'in_progress' && (
                    <>
                      <option value="approved">Одобрить</option>
                      <option value="rejected">Отклонить</option>
                    </>
                  )}
                </select>
                <Button
                  variant="primary"
                  onClick={updateStatus}
                  disabled={!newStatus || actionLoading}
                  loading={actionLoading}
                >
                  Применить
                </Button>
              </div>
            </div>
          )}

          {/* Комментарий */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Комментарий</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Добавить комментарий к заявке..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
            <Button
              variant="secondary"
              onClick={addComment}
              disabled={!comment.trim() || actionLoading}
              loading={actionLoading}
              className="mt-2"
            >
              Оставить комментарий
            </Button>
          </div>

          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          {actionSuccess && <p className="text-sm text-green-600">{actionSuccess}</p>}
        </div>
      </div>
    </div>
  );
}
