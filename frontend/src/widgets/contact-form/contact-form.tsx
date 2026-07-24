'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { object, pipe, string, minLength, email, type InferOutput } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { api } from '@/shared/api';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import type { ContactMessage } from '@/shared/api/types';

const schema = object({
  name: pipe(string(), minLength(1, 'Обязательное поле')),
  email: pipe(string(), minLength(1, 'Обязательное поле'), email('Некорректный email')),
  phone: pipe(string(), minLength(1, 'Обязательное поле')),
  message: pipe(string(), minLength(1, 'Обязательное поле')),
  consent: pipe(string(), minLength(1, 'Необходимо дать согласие')),
});

type FormValues = InferOutput<typeof schema>;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(schema),
    defaultValues: { consent: '' },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!data.consent) {
      setError('consent', { message: 'Необходимо дать согласие' });
      return;
    }

    setSubmitState('submitting');
    setErrorMessage('');

    try {
      let attachmentId: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/files/upload?ownerType=contact_message&ownerId=0`,
          { method: 'POST', body: formData },
        );
        if (!uploadRes.ok) throw new Error('Ошибка загрузки файла');
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
    } catch (err) {
      setSubmitState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  if (submitState === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-800 font-medium">
          Сообщение отправлено. Мы свяжемся с вами в ближайшее время.
        </p>
        <button
          onClick={() => setSubmitState('idle')}
          className="mt-4 text-sm font-semibold text-green-700 hover:text-green-600 inline-flex items-center min-h-[44px]"
        >
          Отправить ещё
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Имя" {...register('name')} error={errors.name?.message} />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="Телефон"
        type="tel"
        {...register('phone')}
        error={errors.phone?.message}
      />
      <Textarea
        label="Сообщение"
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
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer min-h-[44px]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            Выбрать файл
          </label>
          <span className="text-sm text-slate-700">Прикрепление файла</span>
        </div>
        {file && (
          <p className="mt-1 text-xs text-slate-500">{file.name}</p>
        )}
      </div>

      <Checkbox
        label="Я согласен на обработку персональных данных"
        value="consent"
        {...register('consent')}
        error={errors.consent?.message}
      />

      {submitState === 'error' && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <Button type="submit" disabled={submitState === 'submitting'}>
        {submitState === 'submitting' ? 'Отправка...' : 'Отправить'}
      </Button>
    </form>
  );
}
