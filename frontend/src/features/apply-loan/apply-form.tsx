'use client';

import { useState, useRef, use, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  object,
  pipe,
  string,
  minLength,
  number,
  optional,
  check,
  type InferOutput,
} from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import Link from 'next/link';
import { api, ApiError, getAuthToken } from '@/shared/api';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { INDIVIDUAL_LIMITS, calculateAnnuity } from '@/shared/lib/calculator';

const BUSINESS_LIMITS = { amount: { min: 30000, max: 500000 }, term: { min: 30, max: 365 } };

type ApplicantType = 'individual' | 'business';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formSchema = object({
  applicantType: string(),
  phone: pipe(string(), minLength(1, 'Обязательное поле')),
  firstName: optional(string()),
  lastName: optional(string()),
  email: optional(pipe(string(), check((v) => v === '' || EMAIL_REGEX.test(v), 'Некорректный email'))),
  companyName: optional(string()),
  registrationNumber: optional(string()),
  companyEmail: optional(pipe(string(), check((v) => v === '' || EMAIL_REGEX.test(v), 'Некорректный email'))),
  companyPhone: optional(string()),
  amount: number('Введите сумму'),
  termDays: number('Введите срок'),
});

type FormValues = InferOutput<typeof formSchema>;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface UploadedFile {
  id: string;
  name: string;
}

export function ApplyForm({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = use(searchParams);
  const initialType: ApplicantType = params.type === 'business' ? 'business' : 'individual';

  const [applicantType, setApplicantType] = useState<ApplicantType>(initialType);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const limits = applicantType === 'individual' ? INDIVIDUAL_LIMITS : BUSINESS_LIMITS;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: { applicantType: initialType },
  });

  const watchAmount = watch('amount');
  const watchTerm = watch('termDays');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/files/upload?ownerType=application&ownerId=0`,
        { method: 'POST', body: formData, headers },
      );
      if (!res.ok) throw new Error('Ошибка загрузки файла');
      const data = await res.json();
      setUploadedFiles((prev) => [...prev, { id: data.id, name: file.name }]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const vals = getValues();
    let valid = true;

    if (!vals.phone?.trim()) { setError('phone', { message: 'Обязательное поле' }); valid = false; }
    if (!vals.amount || vals.amount <= 0) { setError('amount', { message: 'Введите сумму' }); valid = false; }
    if (!vals.termDays || vals.termDays <= 0) { setError('termDays', { message: 'Введите срок' }); valid = false; }

    if (applicantType === 'individual') {
      if (!vals.firstName?.trim()) { setError('firstName', { message: 'Обязательное поле' }); valid = false; }
      if (!vals.lastName?.trim()) { setError('lastName', { message: 'Обязательное поле' }); valid = false; }
    } else {
      if (!vals.companyName?.trim()) { setError('companyName', { message: 'Обязательное поле' }); valid = false; }
      if (!vals.registrationNumber?.trim()) { setError('registrationNumber', { message: 'Обязательное поле' }); valid = false; }
    }

    if (valid) {
      handleSubmit(onSubmit)(e);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitState('submitting');
    setErrorMessage('');

    if (data.amount < limits.amount.min || data.amount > limits.amount.max) {
      setErrorMessage(`Сумма должна быть от ${limits.amount.min.toLocaleString()} до ${limits.amount.max.toLocaleString()} EUR`);
      setSubmitState('error'); return;
    }
    if (data.termDays < limits.term.min || data.termDays > limits.term.max) {
      setErrorMessage(`Срок должен быть от ${limits.term.min} до ${limits.term.max} дней`);
      setSubmitState('error'); return;
    }

    try {
      const payload: Record<string, unknown> = {
        applicantType,
        phone: data.phone,
        amount: data.amount,
        termDays: data.termDays,
        fileAttachmentIds: uploadedFiles.map((f) => f.id),
      };

      if (applicantType === 'individual') {
        payload.firstName = data.firstName;
        payload.lastName = data.lastName;
        if (data.email) payload.email = data.email;
      } else {
        payload.companyName = data.companyName;
        payload.registrationNumber = data.registrationNumber;
        if (data.companyEmail) payload.companyEmail = data.companyEmail;
        if (data.companyPhone) payload.companyPhone = data.companyPhone;
      }

      const res = await api.post<{ id: string }>('/applications', payload);
      setSuccessId(res.id);
      setSubmitState('success');
      reset();
      setUploadedFiles([]);
    } catch (err) {
      setSubmitState('error');
      if (err instanceof ApiError) {
        const body = err.body as { message?: string | string[] };
        const msg = Array.isArray(body.message) ? body.message[0] : body.message;
        setErrorMessage(msg ?? 'Произошла ошибка при отправке заявки');
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'Произошла ошибка');
      }
    }
  };

  if (submitState === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center space-y-4">
        <p className="text-green-800 font-medium">
          Заявка отправлена. Мы свяжемся с вами в ближайшее время.
        </p>
        {successId && (
          <p className="text-sm text-green-700">
            Номер заявки: <span className="font-mono">{successId}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => { setSubmitState('idle'); setSuccessId(null); }}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 cursor-pointer inline-flex items-center min-h-[44px]"
          >
            Подать ещё одну заявку
          </button>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors min-h-[44px]"
          >
            В личный кабинет
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Select
            label="Тип заявителя"
            value={applicantType}
            onChange={(e) => {
              setApplicantType(e.target.value as ApplicantType);
              setUploadedFiles([]);
            }}
          >
            <option value="individual">Физическое лицо</option>
            <option value="business">Бизнес</option>
          </Select>

          <Input
            label="Телефон *"
            type="tel"
            placeholder="+353..."
            {...register('phone')}
            error={errors.phone?.message}
          />

          {applicantType === 'individual' ? (
            <>
              <Input
                label="Имя *"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
              <Input
                label="Фамилия *"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </>
          ) : (
            <>
              <Input
                label="Название компании *"
                {...register('companyName')}
                error={errors.companyName?.message}
              />
              <Input
                label="Регистрационный номер *"
                {...register('registrationNumber')}
                error={errors.registrationNumber?.message}
              />
              <Input
                label="Email компании"
                type="email"
                {...register('companyEmail')}
                error={errors.companyEmail?.message}
              />
              <Input
                label="Телефон компании"
                type="tel"
                {...register('companyPhone')}
                error={errors.companyPhone?.message}
              />
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Сумма (EUR) *"
              type="number"
              placeholder={`${limits.amount.min.toLocaleString()}–${limits.amount.max.toLocaleString()}`}
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />
            <Input
              label="Срок (дней) *"
              type="number"
              placeholder={`${limits.term.min}–${limits.term.max}`}
              {...register('termDays', { valueAsNumber: true })}
              error={errors.termDays?.message}
            />
          </div>

          {watchAmount > 0 && watchTerm > 0 && (
            <div className="rounded-lg bg-indigo-50 p-4 text-sm text-slate-700">
              {(() => {
                const { payment, total } = calculateAnnuity(watchAmount, watchTerm);
                return (
                  <>
                    <p>
                      Платёж: ~<span className="font-semibold">{Math.round(payment)}</span> EUR/день
                    </p>
                    <p>
                      Итого к возврату: ~<span className="font-semibold">{Math.round(total)}</span> EUR
                    </p>
                  </>
                );
              })()}
            </div>
          )}

          {applicantType === 'business' && (
            <div className="space-y-3">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="sr-only"
                id="business-files"
              />
              <div className="flex items-center gap-2">
                <label
                  htmlFor="business-files"
                  className={[
                    'inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors min-h-[44px]',
                    isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  {isUploading ? 'Загрузка...' : 'Выбрать файл'}
                </label>
                <span className="text-sm text-slate-700">Документы (Certificate of Incorporation и т.п.)</span>
              </div>
              {isUploading && <p className="text-xs text-slate-500">Загрузка...</p>}
              {uploadedFiles.length > 0 && (
                <ul className="space-y-1">
                  {uploadedFiles.map((f) => (
                    <li key={f.id} className="flex items-center justify-between text-sm text-slate-700">
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs shrink-0 inline-flex items-center min-h-[36px]"
                      >
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {submitState === 'error' && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <Button type="submit" disabled={submitState === 'submitting' || isUploading}>
            {submitState === 'submitting' ? 'Отправка...' : 'Отправить заявку'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
