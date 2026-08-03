import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { resolveDisplayName } from '../../common/utils/applicant-name';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async checkOverduePayments() {
    const now = new Date();

    // Атомарно обновляем pending → overdue и получаем только что обновлённые ID
    const updated = await this.prisma.$queryRaw<{ id: string }[]>`
      UPDATE "PaymentScheduleItem"
      SET status = 'overdue'
      WHERE status = 'pending' AND "dueDate" < ${now}
      RETURNING id
    `;

    if (updated.length === 0) return 0;

    const overdueItems = await this.prisma.paymentScheduleItem.findMany({
      where: { id: { in: updated.map((r) => r.id) } },
      include: { loan: true },
    });

    for (const item of overdueItems) {
      this.eventEmitter.emit('payment.overdue', {
        loanId: item.loanId,
        userId: item.loan.userId,
        scheduleItemId: item.id,
      });
    }

    return overdueItems.length;
  }

  async findAll(search?: string, take?: number, skip?: number) {
    await this.checkOverduePayments();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const effectiveTake = take ?? 20;
    const effectiveSkip = skip ?? 0;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          applications: { orderBy: { createdAt: 'desc' } },
          loans: {
            include: {
              scheduleItems: true,
              payments: true,
            },
          },
          paymentRequests: {
            include: { loan: true },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: effectiveTake,
        skip: effectiveSkip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        phone: user.phone,
        name: resolveDisplayName(user, user.applications[0]),
        createdAt: user.createdAt,
        applicationsCount: user.applications.length,
        activeLoansCount: user.loans.filter((l) => l.status === 'active').length,
        closedLoansCount: user.loans.filter((l) => l.status === 'closed').length,
        totalLoansAmount: Math.round(user.loans.reduce((sum, l) => sum + l.amount, 0) * 100) / 100,
      })),
      total,
      limit: effectiveTake,
      offset: effectiveSkip,
    };
  }

  async findOne(id: string) {
    await this.checkOverduePayments();

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          include: { loan: true },
        },
        loans: {
          include: {
            scheduleItems: { orderBy: { dueDate: 'asc' } },
            payments: { orderBy: { date: 'desc' } },
            application: true,
          },
        },
        paymentRequests: {
          include: { loan: true, payment: true },
          orderBy: { createdAt: 'desc' },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      name: resolveDisplayName(user, user.applications[0]),
      createdAt: user.createdAt,
      applications: user.applications,
      loans: user.loans,
      paymentRequests: user.paymentRequests,
      recentNotifications: user.notifications,
    };
  }
}
