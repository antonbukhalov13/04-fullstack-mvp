const DAILY_RATE = 0.008;

export function calculateAnnuity(principal: number, termDays: number): {
  payment: number;
  total: number;
} {
  const r = DAILY_RATE;
  const n = termDays;
  const factor = Math.pow(1 + r, n);
  const payment = principal * ((r * factor) / (factor - 1));
  const roundedPayment = Math.round(payment * 100) / 100;
  const total = Math.round(roundedPayment * n * 100) / 100;

  return { payment: roundedPayment, total };
}

export const INDIVIDUAL_LIMITS = {
  amount: { min: 500, max: 50000 },
  term: { min: 7, max: 90 },
} as const;
