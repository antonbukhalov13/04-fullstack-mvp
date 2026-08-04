'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { object, pipe, string, minLength, email, check, type InferOutput } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { api, getAuthToken } from '@/shared/api';
import { isValidPhone, PHONE_ERROR } from '@/shared/lib/phone';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import type { ContactMessage } from '@/shared/api/types';

const schema = object({
  name: pipe(string(), minLength(1, 'Обязательное поле')),
  email: pipe(string(), minLength(1, 'Обязательное поле'), email('Некорректный email')),
  phone: pipe(string(), check((v) => isValidPhone(v), PHONE_ERROR)),
  message: pipe(string(), minLength(1, 'Обязательное поле')),
});

type FormValues = InferOutput<typeof schema>;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!consent) {
      setConsentError('Необходимо дать согласие');
      return;
    }
    setConsentError('');
    setSubmitState('submitting');
    setErrorMessage('');

    try {
      let attachmentId: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/files/upload?ownerType=contact_message&ownerId=0`,
          { method: 'POST', body: formData, headers },
        );
        if (!uploadRes.ok) {
          const errBody = await uploadRes.json().catch(() => ({}));
          throw new Error(errBody.message || 'Ошибка загрузки файла');
        }
        const uploadData = await uploadRes.json();
        attachmentId = uploadData.id;
      }

      await api.post<ContactMessage>('/contact-messages', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        attachmentId,
      });

      setSubmitState('success');
      reset();
      setFile(null);
      setConsent(false);
    } catch (err) {
      setSubmitState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!consent) {
      setConsentError('Необходимо дать согласие');
    } else {
      setConsentError('');
    }
    handleSubmit(onSubmit)(e);
  };

  if (submitState === 'success') {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <p className="text-green-300 font-medium">
          Сообщение отправлено. Мы свяжемся с вами в ближайшее время.
        </p>
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setSubmitState('idle')}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold cursor-pointer transition-colors px-6 py-3 text-sm min-h-[44px] text-slate-400 hover:text-slate-200"
          >
            Отправить ещё
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <Input dark label="Имя *" {...register('name')} error={errors.name?.message} />
      <Input
        dark
        label="Email *"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        dark
        label="Телефон *"
        type="tel"
        {...register('phone')}
        error={errors.phone?.message}
      />
      <Textarea
        dark
        label="Сообщение *"
        rows={4}
        {...register('message')}
        error={errors.message?.message}
      />

      <div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="sr-only"
          id="contact-file"
        />
        <div className="flex items-center gap-2">
          <label
            htmlFor="contact-file"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer min-h-[44px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            Выбрать файл
          </label>
          <span className="text-sm text-slate-300">Прикрепление файла</span>
        </div>
        {file && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-slate-400 truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-2 text-red-400 hover:text-red-300 text-xs shrink-0 inline-flex items-center min-h-[36px] transition-colors"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setConsentError('');
            }}
            className="h-4 w-4 rounded border-slate-600 accent-indigo-600 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
          />
          <span className="text-sm text-slate-300">Я согласен на обработку персональных данных</span>
        </div>
        {consentError && <p className="text-xs text-red-400">{consentError}</p>}
      </div>

      {submitState === 'error' && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <Button type="submit" disabled={submitState === 'submitting'}>
        {submitState === 'submitting' ? 'Отправка...' : 'Отправить'}
      </Button>
    </form>
  );
}
