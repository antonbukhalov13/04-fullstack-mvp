'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { object, pipe, number, minValue, maxValue, type InferOutput } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { calculateAnnuity, INDIVIDUAL_LIMITS } from '@/shared/lib/calculator';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

const schema = object({
  amount: pipe(
    number(),
    minValue(INDIVIDUAL_LIMITS.amount.min),
    maxValue(INDIVIDUAL_LIMITS.amount.max),
  ),
  termDays: pipe(
    number(),
    minValue(INDIVIDUAL_LIMITS.term.min),
    maxValue(INDIVIDUAL_LIMITS.term.max),
  ),
});

type FormValues = InferOutput<typeof schema>;

export function Calculator() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(schema),
    defaultValues: {
      amount: 1000,
      termDays: 30,
    },
  });

  const amount = watch('amount');
  const termDays = watch('termDays');

  const isValid =
    amount >= INDIVIDUAL_LIMITS.amount.min &&
    amount <= INDIVIDUAL_LIMITS.amount.max &&
    termDays >= INDIVIDUAL_LIMITS.term.min &&
    termDays <= INDIVIDUAL_LIMITS.term.max;

  const result = isValid ? calculateAnnuity(amount, termDays) : null;

  const onSubmit: SubmitHandler<FormValues> = () => {
    window.location.href = '/apply';
  };

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Кредитный калькулятор
          </h2>
          <p className="mt-3 text-slate-500">
            Рассчитайте условия займа за несколько секунд — выберите сумму и срок,
            чтобы сразу увидеть итоговую сумму к возврату. Все условия отображаются
            до оформления займа.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-10 max-w-lg space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Сумма (EUR)"
              type="number"
              step={100}
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
            />
            <Input
              label="Срок (дней)"
              type="number"
              step={1}
              {...register('termDays', { valueAsNumber: true })}
              error={errors.termDays?.message}
            />
          </div>

          <p className="text-xs text-slate-400 text-center">
            От {INDIVIDUAL_LIMITS.amount.min.toLocaleString('ru-RU')} до{' '}
            {INDIVIDUAL_LIMITS.amount.max.toLocaleString('ru-RU')} EUR &middot; от{' '}
            {INDIVIDUAL_LIMITS.term.min} до {INDIVIDUAL_LIMITS.term.max} дней
          </p>

          {result && (
            <div className="rounded-xl bg-indigo-50 p-6 text-center">
              <p className="text-sm text-slate-500">Ежемесячный платёж</p>
              <p className="mt-1 text-3xl font-bold text-indigo-600">
                {result.payment.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 })}{' '}
                EUR
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Общая сумма к возврату:{' '}
                <span className="font-medium text-slate-700">
                  {result.total.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 })}{' '}
                  EUR
                </span>
              </p>
            </div>
          )}

          <div className="text-center">
            <Button type="submit" size="lg">
              Получить займ
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Расчёт носит ознакомительный характер. Итоговые условия зависят от
            результатов проверки клиента.
          </p>
        </form>
      </div>
    </section>
  );
}
