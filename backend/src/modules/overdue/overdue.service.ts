import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OverdueService {
  private readonly logger = new Logger(OverdueService.name);

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

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      await this.checkOverduePayments();
    } catch (error) {
      this.logger.error('Failed to run overdue payments check', error);
    }
  }
}
