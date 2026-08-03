import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DecidePaymentRequestDto } from './dto/decide-payment-request.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async decidePaymentRequest(
    paymentRequestId: string,
    dto: DecidePaymentRequestDto,
    adminId: string,
  ) {
    const paymentRequest = await this.prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      include: { loan: true },
    });

    if (!paymentRequest) {
      throw new NotFoundException(
        `Заявка на оплату с id ${paymentRequestId} не найдена`,
      );
    }

    if (paymentRequest.loan.status !== 'active') {
      throw new BadRequestException('Займ должен быть активным');
    }

    let payment: { id: string; amount: number } | null = null;

    if (dto.status === 'approved') {
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          // Re-read inside transaction to prevent double-approval race
          const fresh = await tx.paymentRequest.findUnique({
            where: { id: paymentRequestId },
          });

          if (!fresh || fresh.status !== 'pending') {
            throw new BadRequestException('Заявка на оплату уже обработана');
          }

          const pendingItems = await tx.paymentScheduleItem.findMany({
            where: {
              loanId: paymentRequest.loanId,
              status: { in: ['pending', 'overdue'] },
            },
          });
          const remaining = pendingItems.reduce(
            (sum, item) => sum + (item.amount - item.paidAmount),
            0,
          );
          const rounded = Math.round(remaining * 100) / 100;

          if (paymentRequest.amount > rounded) {
            throw new BadRequestException(
              `Сумма платежа (${paymentRequest.amount}) превышает остаток задолженности (${rounded})`,
            );
          }

          const created = await tx.payment.create({
            data: {
              loanId: paymentRequest.loanId,
              paymentRequestId: paymentRequest.id,
              amount: paymentRequest.amount,
              recordedByAdminId: adminId,
            },
          });

          await tx.paymentRequest.update({
            where: { id: paymentRequestId },
            data: { status: dto.status },
          });

          await this.recalculateSchedule(tx, paymentRequest.loanId, paymentRequest.amount);

          return { created };
        });

        payment = { id: result.created.id, amount: result.created.amount };
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new BadRequestException('Заявка на оплату уже была обработана');
        }
        throw err;
      }

      this.eventEmitter.emit('payment-request.status.changed', {
        paymentRequestId: paymentRequest.id,
        loanId: paymentRequest.loanId,
        userId: paymentRequest.userId,
        newStatus: dto.status,
      });

      this.eventEmitter.emit('payment.recorded', {
        paymentId: payment.id,
        loanId: paymentRequest.loanId,
        userId: paymentRequest.userId,
      });
    } else {
      const updated = await this.prisma.paymentRequest.updateMany({
        where: { id: paymentRequestId, status: 'pending' },
        data: { status: dto.status },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Заявка на оплату уже обработана');
      }

      this.eventEmitter.emit('payment-request.status.changed', {
        paymentRequestId: paymentRequest.id,
        loanId: paymentRequest.loanId,
        userId: paymentRequest.userId,
        newStatus: dto.status,
      });
    }

    return {
      paymentRequest: {
        id: paymentRequest.id,
        status: dto.status,
      },
      payment,
    };
  }

  async recordDirectPayment(
    loanId: string,
    dto: RecordPaymentDto,
    adminId: string,
  ) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    if (loan.status !== 'active') {
      throw new BadRequestException('Loan must be active');
    }

    const pendingItems = await this.prisma.paymentScheduleItem.findMany({
      where: { loanId, status: { in: ['pending', 'overdue'] } },
    });
    const remaining = pendingItems.reduce(
      (sum, item) => sum + (item.amount - item.paidAmount),
      0,
    );
    const rounded = Math.round(remaining * 100) / 100;

    if (dto.amount > rounded) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining balance (${rounded})`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          loanId,
          amount: dto.amount,
          recordedByAdminId: adminId,
        },
      });

      await this.recalculateSchedule(tx, loanId, dto.amount);

      return { created };
    });

    this.eventEmitter.emit('payment.recorded', {
      paymentId: result.created.id,
      loanId,
      userId: loan.userId,
    });

    return {
      id: result.created.id,
      loanId: result.created.loanId,
      amount: result.created.amount,
      date: result.created.date,
    };
  }

  async markScheduleItemPaidAdmin(
    loanId: string,
    itemId: string,
    amount: number,
    adminId: string,
  ) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundException(`Loan with id ${loanId} not found`);
    if (loan.status !== 'active') throw new BadRequestException('Loan must be active');

    const item = await this.prisma.paymentScheduleItem.findFirst({
      where: { id: itemId, loanId },
    });
    if (!item) throw new NotFoundException(`Schedule item with id ${itemId} not found`);

    const remaining = Math.round((item.amount - item.paidAmount) * 100) / 100;
    if (amount > remaining) {
      throw new BadRequestException(`Payment amount (${amount}) exceeds remaining for this item (${remaining})`);
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          loanId,
          amount,
          recordedByAdminId: adminId,
        },
      });

      await this.recalculateSchedule(tx, loanId, amount);

      return created;
    });

    return { id: payment.id, amount: payment.amount, scheduleItemId: item.id };
  }

  private async recalculateSchedule(
    tx: any,
    loanId: string,
    paymentAmount: number,
  ) {
    const pendingItems = await tx.paymentScheduleItem.findMany({
      where: { loanId, status: { in: ['pending', 'overdue'] } },
      orderBy: { dueDate: 'asc' },
    });

    let remaining = paymentAmount;

    // 1) Погашаем просроченные платежи (уже наступившие) по порядку
    let index = 0;
    while (index < pendingItems.length && pendingItems[index].status === 'overdue' && remaining > 0) {
      const item = pendingItems[index];
      const itemRemaining = item.amount - item.paidAmount;

      if (itemRemaining > 0) {
        if (remaining >= itemRemaining) {
          remaining -= itemRemaining;
          await tx.paymentScheduleItem.update({
            where: { id: item.id },
            data: { paidAmount: item.amount, status: 'paid' },
          });
        } else {
          await tx.paymentScheduleItem.update({
            where: { id: item.id },
            data: { paidAmount: Math.round((item.paidAmount + remaining) * 100) / 100 },
          });
          remaining = 0;
        }
      }
      index++;
    }

    // 2) Покрываем ближайший (текущий) платёж
    if (remaining > 0 && index < pendingItems.length) {
      const item = pendingItems[index];
      const itemRemaining = item.amount - item.paidAmount;

      if (remaining < itemRemaining) {
        await tx.paymentScheduleItem.update({
          where: { id: item.id },
          data: { paidAmount: Math.round((item.paidAmount + remaining) * 100) / 100 },
        });
        remaining = 0;
      } else {
        remaining -= itemRemaining;
        await tx.paymentScheduleItem.update({
          where: { id: item.id },
          data: { paidAmount: item.amount, status: 'paid' },
        });
      }
      index++;
    }

    // 3) Излишек уменьшает последние элементы графика (даты не меняются)
    for (let j = pendingItems.length - 1; j >= index && remaining > 0; j--) {
      const tail = pendingItems[j];
      const tailRemaining = tail.amount - tail.paidAmount;
      if (tailRemaining <= 0) continue;

      if (remaining >= tailRemaining) {
        remaining -= tailRemaining;
        await tx.paymentScheduleItem.update({
          where: { id: tail.id },
          data: { paidAmount: tail.amount, status: 'paid' },
        });
      } else {
        await tx.paymentScheduleItem.update({
          where: { id: tail.id },
          data: { amount: Math.round((tail.amount - remaining) * 100) / 100 },
        });
        remaining = 0;
      }
    }

    // 4) Платёж покрыл весь график — закрываем займ
    if (remaining > 0) {
      for (const item of pendingItems) {
        await tx.paymentScheduleItem.update({
          where: { id: item.id },
          data: { paidAmount: item.amount, status: 'paid' },
        });
      }
    }

    const stillPending = await tx.paymentScheduleItem.count({
      where: { loanId, status: { in: ['pending', 'overdue'] } },
    });

    if (stillPending === 0) {
      await tx.loan.update({
        where: { id: loanId },
        data: { status: 'closed' },
      });

      const loan = await tx.loan.findUnique({ where: { id: loanId } });

      this.eventEmitter.emit('loan.closed', {
        loanId,
        userId: loan!.userId,
      });
    }
  }
}
