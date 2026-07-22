import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, message: string) {
    return this.prisma.notification.create({
      data: { userId, type, message },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @OnEvent('application.status.changed')
  async onApplicationStatusChanged(payload: {
    applicationId: string;
    userId: string;
    previousStatus: string;
    newStatus: string;
  }) {
    const message =
      payload.newStatus === 'approved'
        ? 'Заявка одобрена'
        : payload.newStatus === 'rejected'
          ? 'Заявка отклонена'
          : null;

    if (message) {
      await this.create(payload.userId, 'application.status.changed', message);
    }
  }

  @OnEvent('loan.created')
  async onLoanCreated(payload: { loanId: string; userId: string }) {
    await this.create(payload.userId, 'loan.created', 'Займ ожидает подписания');
  }

  @OnEvent('loan.signed')
  async onLoanSigned(payload: { loanId: string; userId: string }) {
    await this.create(payload.userId, 'loan.signed', 'Займ подписан и активирован');
  }

  @OnEvent('payment-request.created')
  async onPaymentRequestCreated(payload: {
    paymentRequestId: string;
    loanId: string;
    userId: string;
  }) {
    await this.create(
      payload.userId,
      'payment-request.created',
      'Заявка на оплату создана',
    );
  }

  @OnEvent('payment-request.status.changed')
  async onPaymentRequestStatusChanged(payload: {
    paymentRequestId: string;
    loanId: string;
    userId: string;
    newStatus: string;
  }) {
    const message =
      payload.newStatus === 'approved'
        ? 'Платёж подтверждён'
        : payload.newStatus === 'rejected'
          ? 'Платёж отклонён'
          : null;

    if (message) {
      await this.create(
        payload.userId,
        'payment-request.status.changed',
        message,
      );
    }
  }

  @OnEvent('payment.recorded')
  async onPaymentRecorded(payload: {
    paymentId: string;
    loanId: string;
    userId: string;
  }) {
    await this.create(payload.userId, 'payment.recorded', 'Платёж зафиксирован');
  }

  @OnEvent('payment.overdue')
  async onPaymentOverdue(payload: {
    loanId: string;
    userId: string;
    scheduleItemId: string;
  }) {
    await this.create(payload.userId, 'payment.overdue', 'Просрочка платежа');
  }

  @OnEvent('loan.closed')
  async onLoanClosed(payload: { loanId: string; userId: string }) {
    await this.create(payload.userId, 'loan.closed', 'Займ закрыт');
  }
}
