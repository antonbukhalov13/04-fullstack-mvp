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
      const created = await this.prisma.payment.create({
        data: {
          loanId: paymentRequest.loanId,
          paymentRequestId: paymentRequest.id,
          amount: paymentRequest.amount,
          recordedByAdminId: adminId,
        },
      });

      payment = { id: created.id, amount: created.amount };

      await this.recalculateSchedule(
        paymentRequest.loanId,
        paymentRequest.amount,
      );
    }

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

    if (payment) {
      this.eventEmitter.emit('payment.recorded', {
        paymentId: payment.id,
        loanId: paymentRequest.loanId,
        userId: paymentRequest.userId,
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

    const payment = await this.prisma.payment.create({
      data: {
        loanId,
        amount: dto.amount,
        recordedByAdminId: adminId,
      },
    });

    await this.recalculateSchedule(loanId, dto.amount);

    this.eventEmitter.emit('payment.recorded', {
      paymentId: payment.id,
      loanId,
      userId: loan.userId,
    });

    return {
      id: payment.id,
      loanId: payment.loanId,
      amount: payment.amount,
      date: payment.date,
    };
  }

  private async recalculateSchedule(loanId: string, paymentAmount: number) {
    const pendingItems = await this.prisma.paymentScheduleItem.findMany({
      where: {
        loanId,
        status: 'pending',
      },
      orderBy: { dueDate: 'asc' },
    });

    let remaining = paymentAmount;

    for (const item of pendingItems) {
      if (remaining <= 0) break;

      if (remaining >= item.amount) {
        remaining -= item.amount;
        await this.prisma.paymentScheduleItem.update({
          where: { id: item.id },
          data: { status: 'paid' },
        });
      } else {
        remaining = 0;
      }
    }

    const stillPending = await this.prisma.paymentScheduleItem.count({
      where: {
        loanId,
        status: 'pending',
      },
    });

    if (stillPending === 0) {
      await this.prisma.loan.update({
        where: { id: loanId },
        data: { status: 'closed' },
      });

      const loan = await this.prisma.loan.findUnique({
        where: { id: loanId },
      });

      this.eventEmitter.emit('loan.closed', {
        loanId,
        userId: loan!.userId,
      });
    }
  }
}
