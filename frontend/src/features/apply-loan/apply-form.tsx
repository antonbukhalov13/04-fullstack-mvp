'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  object,
  pipe,
  string,
  minLength,
  email,
  number,
  optional,
  type InferOutput,
} from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { api, ApiError } from '@/shared/api';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { INDIVIDUAL_LIMITS } from '@/shared/lib/calculator';

const BUSINESS_LIMITS = { amount: { min: 30000, max: 500000 }, term: { min: 30, max: 365 } };

type ApplicantType = 'individual' | 'business';

const formSchema = object({
  applicantType: string(),
  phone: pipe(string(), minLength(1, 'Обязательное поле')),
  firstName: optional(string()),
  lastName: optional(string()),
  email: optional(pipe(string(), email('Некорректный email'))),
  companyName: optional(string()),
  registrationNumber: optional(string()),
  companyEmail: optional(pipe(string(), email('Некорректный email'))),
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

export function ApplyForm() {
  const [applicantType, setApplicantType] = useState<ApplicantType>('individual');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const limits = applicantType === 'individual' ? INDIVIDUAL_LIMITS : BUSINESS_LIMITS;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: { applicantType: 'individual' },
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/files/upload?ownerType=application&ownerId=0`,
        { method: 'POST', body: formData },
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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitState('submitting');
    setErrorMessage('');

    if (applicantType === 'individual') {
      if (!data.firstName?.trim()) { setErrorMessage('Обязательное поле: Имя'); setSubmitState('error'); return; }
      if (!data.lastName?.trim()) { setErrorMessage('Обязательное поле: Фамилия'); setSubmitState('error'); return; }
    } else {
      if (!data.companyName?.trim()) { setErrorMessage('Обязательное поле: Название компании'); setSubmitState('error'); return; }
      if (!data.registrationNumber?.trim()) { setErrorMessage('Обязательное поле: Регистрационный номер'); setSubmitState('error'); return; }
    }

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
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-800 font-medium">
          Заявка отправлена. Мы свяжемся с вами в ближайшее время.
        </p>
        {successId && (
          <p className="mt-2 text-sm text-green-700">
            Номер заявки: <span className="font-mono">{successId}</span>
          </p>
        )}
        <button
          onClick={() => { setSubmitState('idle'); setSuccessId(null); }}
          className="mt-4 text-sm font-semibold text-green-700 hover:text-green-600"
        >
          Подать ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            label="Телефон"
            type="tel"
            placeholder="+353..."
            {...register('phone')}
            error={errors.phone?.message}
          />

          {applicantType === 'individual' ? (
            <>
              <Input
                label="Имя"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
              <Input
                label="Фамилия"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
              <Input
                label="Email (необязательно)"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </>
          ) : (
            <>
              <Input
                label="Название компании"
                {...register('companyName')}
                error={errors.companyName?.message}
              />
              <Input
                label="Регистрационный номер"
                {...register('registrationNumber')}
                error={errors.registrationNumber?.message}
              />
              <Input
                label="Email компании (необязательно)"
                type="email"
                {...register('companyEmail')}
                error={errors.companyEmail?.message}
              />
              <Input
                label="Телефон компании (необязательно)"
                type="tel"
                {...register('companyPhone')}
                error={errors.companyPhone?.message}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Сумма (EUR)"
              type="number"
              placeholder={`${limits.amount.min.toLocaleString()}–${limits.amount.max.toLocaleString()}`}
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />
            <Input
              label="Срок (дней)"
              type="number"
              placeholder={`${limits.term.min}–${limits.term.max}`}
              {...register('termDays', { valueAsNumber: true })}
              error={errors.termDays?.message}
            />
          </div>

          {watchAmount > 0 && watchTerm > 0 && (
            <div className="rounded-lg bg-indigo-50 p-4 text-sm text-slate-700">
              <p>
                Платёж: ~<span className="font-semibold">{Math.round((watchAmount * 0.008 * Math.pow(1.008, watchTerm)) / (Math.pow(1.008, watchTerm) - 1))}</span> EUR/день
              </p>
              <p>
                Итого к возврату: ~<span className="font-semibold">{Math.round(Math.round((watchAmount * 0.008 * Math.pow(1.008, watchTerm)) / (Math.pow(1.008, watchTerm) - 1)) * watchTerm)}</span> EUR
              </p>
            </div>
          )}

          {applicantType === 'business' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                Документы (Certificate of Incorporation и т.п.)
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
              />
              {isUploading && <p className="text-xs text-slate-500">Загрузка...</p>}
              {uploadedFiles.length > 0 && (
                <ul className="space-y-1">
                  {uploadedFiles.map((f) => (
                    <li key={f.id} className="flex items-center justify-between text-sm text-slate-700">
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs shrink-0"
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
