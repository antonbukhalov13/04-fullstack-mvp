import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveDisplayName } from '../../common/utils/applicant-name';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, message: string) {
    return this.prisma.notification.create({
      data: { userId, type, message },
    });
  }

  async findByUser(userId: string, take: number, skip: number) {
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { data: items, total, limit: take, offset: skip };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return { success: false };
    }
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  }

  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async findAllAdmin(take: number, skip: number) {
    const where = {};
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          type: true,
          message: true,
          isRead: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              applications: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                select: { firstName: true, lastName: true, companyName: true },
              },
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return {
      data: items.map((item: any) => ({
        ...item,
        user: {
          id: item.user.id,
          name: resolveDisplayName(item.user, item.user?.applications?.[0]),
          phone: item.user.phone,
        },
      })),
      total,
      limit: take,
      offset: skip,
    };
  }

  async markAsReadAdmin(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return { success: false };
    }
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  }

  async countUnreadAdmin() {
    const count = await this.prisma.notification.count({
      where: { isRead: false },
    });
    return { count };
  }

  async markAllAsReadAdmin() {
    await this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  @OnEvent('application.status.changed')
  async onApplicationStatusChanged(payload: {
    applicationId: string;
    userId: string;
    previousStatus: string;
    newStatus: string;
  }) {
    try {
      const message =
        payload.newStatus === 'approved'
          ? 'Заявка одобрена'
          : payload.newStatus === 'rejected'
            ? 'Заявка отклонена'
            : null;

      if (message) {
        await this.create(payload.userId, 'application.status.changed', message);
      }
    } catch (err) {
      this.logger.error('Failed to create notification for application.status.changed', err);
    }
  }

  @OnEvent('loan.created')
  async onLoanCreated(payload: { loanId: string; userId: string }) {
    try {
      await this.create(payload.userId, 'loan.created', 'Займ ожидает подписания');
    } catch (err) {
      this.logger.error('Failed to create notification for loan.created', err);
    }
  }

  @OnEvent('loan.signed')
  async onLoanSigned(payload: { loanId: string; userId: string }) {
    try {
      await this.create(payload.userId, 'loan.signed', 'Займ подписан и активирован');
    } catch (err) {
      this.logger.error('Failed to create notification for loan.signed', err);
    }
  }

  @OnEvent('payment-request.created')
  async onPaymentRequestCreated(payload: {
    paymentRequestId: string;
    loanId: string;
    userId: string;
  }) {
    try {
      await this.create(
        payload.userId,
        'payment-request.created',
        'Заявка на оплату создана',
      );
    } catch (err) {
      this.logger.error('Failed to create notification for payment-request.created', err);
    }
  }

  @OnEvent('payment-request.status.changed')
  async onPaymentRequestStatusChanged(payload: {
    paymentRequestId: string;
    loanId: string;
    userId: string;
    newStatus: string;
  }) {
    try {
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
    } catch (err) {
      this.logger.error('Failed to create notification for payment-request.status.changed', err);
    }
  }

  @OnEvent('payment.recorded')
  async onPaymentRecorded(payload: {
    paymentId: string;
    loanId: string;
    userId: string;
  }) {
    try {
      await this.create(payload.userId, 'payment.recorded', 'Платёж зафиксирован');
    } catch (err) {
      this.logger.error('Failed to create notification for payment.recorded', err);
    }
  }

  @OnEvent('payment.overdue')
  async onPaymentOverdue(payload: {
    loanId: string;
    userId: string;
    scheduleItemId: string;
  }) {
    try {
      await this.create(payload.userId, 'payment.overdue', 'Просрочка платежа');
    } catch (err) {
      this.logger.error('Failed to create notification for payment.overdue', err);
    }
  }

  @OnEvent('loan.closed')
  async onLoanClosed(payload: { loanId: string; userId: string }) {
    try {
      await this.create(payload.userId, 'loan.closed', 'Займ закрыт');
    } catch (err) {
      this.logger.error('Failed to create notification for loan.closed', err);
    }
  }
}
