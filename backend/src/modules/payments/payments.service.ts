import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
      throw new NotFoundException(`Payment request with id ${paymentRequestId} not found`);
    }

    if (paymentRequest.status !== 'pending') {
      throw new BadRequestException('Payment request is not pending');
    }

    if (paymentRequest.loan.status !== 'active') {
      throw new BadRequestException('Loan must be active');
    }

    let payment: { id: string; amount: number } | null = null;

    if (dto.status === 'approved') {
      const result = await this.prisma.$transaction(async (tx) => {
        const created = await tx.payment.create({
          data: {
            loanId: paymentRequest.loanId,
            paymentRequestId: paymentRequest.id,
            amount: paymentRequest.amount,
            recordedByAdminId: adminId,
          },
        });

        const updatedPr = await tx.paymentRequest.update({
          where: { id: paymentRequestId },
          data: { status: dto.status },
        });

        return { created, updatedPr };
      });

      payment = { id: result.created.id, amount: result.created.amount };

      await this.recalculateSchedule(paymentRequest.loanId, paymentRequest.amount);

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
      await this.prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: dto.status },
      });

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
      where: { loanId, status: 'pending' },
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

      return { created };
    });

    await this.recalculateSchedule(loanId, dto.amount);

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

    const payment = await this.prisma.payment.create({
      data: {
        loanId,
        amount,
        recordedByAdminId: adminId,
      },
    });

    await this.recalculateSchedule(loanId, amount);

    return { id: payment.id, amount: payment.amount, scheduleItemId: item.id };
  }

  private async recalculateSchedule(loanId: string, paymentAmount: number) {
    const pendingItems = await this.prisma.paymentScheduleItem.findMany({
      where: { loanId, status: 'pending' },
      orderBy: { dueDate: 'asc' },
    });

    let remaining = paymentAmount;

    for (const item of pendingItems) {
      if (remaining <= 0) break;

      const itemRemaining = item.amount - item.paidAmount;
      if (itemRemaining <= 0) continue;

      if (remaining >= itemRemaining) {
        remaining -= itemRemaining;
        await this.prisma.paymentScheduleItem.update({
          where: { id: item.id },
          data: { paidAmount: item.amount, status: 'paid' },
        });
      } else {
        await this.prisma.paymentScheduleItem.update({
          where: { id: item.id },
          data: { paidAmount: item.paidAmount + remaining },
        });
        remaining = 0;
      }
    }

    const stillPending = await this.prisma.paymentScheduleItem.count({
      where: { loanId, status: 'pending' },
    });

    if (stillPending === 0) {
      await this.prisma.loan.update({
        where: { id: loanId },
        data: { status: 'closed' },
      });

      const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });

      this.eventEmitter.emit('loan.closed', {
        loanId,
        userId: loan!.userId,
      });
    }
  }
}
