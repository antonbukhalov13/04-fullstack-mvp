import { Injectable, BadRequestException } from '@nestjs/common';

export const DAILY_RATE = 0.008;

export interface EstimateResult {
  amount: number;
  termDays: number;
  dailyRate: number;
  payment: number;
  total: number;
}

@Injectable()
export class CalculatorService {
  private readonly dailyRate = DAILY_RATE;

  estimate(amount: number, termDays: number): EstimateResult {
    if (amount <= 0 || termDays <= 0) {
      throw new BadRequestException('Amount and term must be positive');
    }

    const r = this.dailyRate;
    const n = termDays;
    const P = amount;

    const factor = Math.pow(1 + r, n);
    const A = (P * (r * factor)) / (factor - 1);
    const total = A * n;

    const payment = Math.round(A * 100) / 100;
    const roundedTotal = Math.round(total * 100) / 100;

    return {
      amount: P,
      termDays: n,
      dailyRate: this.dailyRate,
      payment,
      total: roundedTotal,
    };
  }
}
