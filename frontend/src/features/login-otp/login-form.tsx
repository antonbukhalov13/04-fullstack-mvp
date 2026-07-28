'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { object, pipe, string, minLength, type InferOutput } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { api, ApiError, setAuthToken } from '@/shared/api';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

type Step = 'phone' | 'code';

const phoneSchema = object({
  phone: pipe(string(), minLength(1, 'Обязательное поле')),
});

const codeSchema = object({
  code: pipe(string(), minLength(6, 'Код должен содержать 6 цифр')),
});

type PhoneForm = InferOutput<typeof phoneSchema>;
type CodeForm = InferOutput<typeof codeSchema>;

type SubmitState = 'idle' | 'submitting' | 'error';

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const phoneForm = useForm<PhoneForm>({
    resolver: valibotResolver(phoneSchema),
  });

  const codeForm = useForm<CodeForm>({
    resolver: valibotResolver(codeSchema),
  });

  const onRequestOtp: SubmitHandler<PhoneForm> = async (data) => {
    setSubmitState('submitting');
    setErrorMessage('');

    try {
      const res = await api.post<{ mockOtp: string }>('/auth/request-otp', { phone: data.phone });
      setPhone(data.phone);
      setMockOtp(res.mockOtp);
      phoneForm.reset();
      setStep('code');
    } catch (err) {
      setSubmitState('error');
      if (err instanceof ApiError) {
        const body = err.body as { message?: string | string[] };
        const msg = Array.isArray(body.message) ? body.message[0] : body.message;
        setErrorMessage(msg ?? 'Ошибка запроса кода');
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'Произошла ошибка');
      }
    } finally {
      setSubmitState('idle');
    }
  };

  const onVerifyOtp: SubmitHandler<CodeForm> = async (data) => {
    setSubmitState('submitting');
    codeForm.clearErrors('code');

    try {
      const res = await api.post<{ accessToken: string; user: { id: string; phone: string; name: string | null } }>(
        '/auth/verify-otp',
        { phone, code: data.code },
      );

      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      setAuthToken(res.accessToken);

      router.push('/dashboard');
    } catch (err) {
      setSubmitState('error');
      if (err instanceof ApiError) {
        const body = err.body as { message?: string | string[] };
        const msg = Array.isArray(body.message) ? body.message[0] : body.message;
        codeForm.setError('code', { message: msg ?? 'Неверный или просроченный код' });
      } else {
        codeForm.setError('code', { message: err instanceof Error ? err.message : 'Произошла ошибка' });
      }
    } finally {
      setSubmitState('idle');
    }
  };

  return (
    <Card>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={phoneForm.handleSubmit(onRequestOtp)} className="space-y-4">
            <p className="text-sm text-slate-600">
              Введите номер телефона, и мы отправим вам код подтверждения
            </p>
            <Input
              label="Телефон"
              type="tel"
              placeholder="+353..."
              {...phoneForm.register('phone')}
              error={phoneForm.formState.errors.phone?.message}
            />

            {submitState === 'error' && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <Button type="submit" disabled={submitState === 'submitting'}>
              {submitState === 'submitting' ? 'Отправка...' : 'Получить код'}
            </Button>
          </form>
        ) : (
          <form onSubmit={codeForm.handleSubmit(onVerifyOtp)} className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">
                Код отправлен на <span className="font-medium">{phone}</span>
              </p>
              {mockOtp && (
                <p className="mt-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                  Тестовый код (dev): <span className="font-mono font-semibold">{mockOtp}</span>
                </p>
              )}
            </div>
            <Input
              label="Код из SMS"
              placeholder="000000"
              maxLength={6}
              {...codeForm.register('code', {
                onChange: () => codeForm.clearErrors('code'),
              })}
              error={codeForm.formState.errors.code?.message}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setStep('phone'); setMockOtp(''); setErrorMessage(''); codeForm.reset(); }}
              >
                Назад
              </Button>
              <Button type="submit" disabled={submitState === 'submitting'}>
                {submitState === 'submitting' ? 'Проверка...' : 'Войти'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
