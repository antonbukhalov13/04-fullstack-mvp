import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfirmSignDto } from './dto/confirm-sign.dto';
import { QueryAdminLoansDto } from './dto/query-admin-loans.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto';
import { MarkScheduleItemPaidDto } from './dto/mark-schedule-item-paid.dto';

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;
const DAILY_RATE = 0.008;

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findByUserId(userId: string) {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        termDays: true,
        dailyRate: true,
        status: true,
        signedAt: true,
        createdAt: true,
        scheduleItems: {
          select: { dueDate: true, amount: true, status: true },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    return loans.map((loan) => {
      const nextPending = loan.status === 'active'
        ? loan.scheduleItems.find((s) => s.status === 'pending')
        : null;
      const lastPaid = loan.status === 'active'
        ? [...loan.scheduleItems].reverse().find((s) => s.status === 'paid')
        : null;
      const closedDate = loan.status === 'closed' ? loan.signedAt : null;

      return {
        id: loan.id,
        amount: loan.amount,
        termDays: loan.termDays,
        status: loan.status,
        signedAt: loan.signedAt,
        createdAt: loan.createdAt,
        nextPayment: nextPending
          ? { amount: nextPending.amount, dueDate: nextPending.dueDate }
          : null,
        lastPaymentDate: lastPaid?.dueDate ?? null,
      };
    });
  }

  async findAllOverdueItemsAdmin() {
    const items = await this.prisma.paymentScheduleItem.findMany({
      where: { status: 'overdue' },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        dueDate: true,
        amount: true,
        status: true,
        loan: {
          select: {
            id: true,
            amount: true,
            status: true,
            user: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    return items.map((item) => ({
      id: item.id,
      dueDate: item.dueDate,
      amount: item.amount,
      status: item.status,
      loanId: item.loan.id,
      loanAmount: item.loan.amount,
      loanStatus: item.loan.status,
      user: item.loan.user,
    }));
  }

  async findAllAdmin(query: QueryAdminLoansDto) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { user: { phone: { contains: query.search } } },
      ];
    }

    const loans = await this.prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        termDays: true,
        dailyRate: true,
        status: true,
        signedAt: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, phone: true },
        },
        scheduleItems: {
          select: { dueDate: true, amount: true, status: true },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    return loans.map((loan) => {
      const totalRepay = loan.scheduleItems.reduce((sum, s) => sum + s.amount, 0);
      const nextPending = loan.status === 'active'
        ? loan.scheduleItems.find((s) => s.status === 'pending')
        : null;

      return {
        id: loan.id,
        amount: loan.amount,
        termDays: loan.termDays,
        status: loan.status,
        signedAt: loan.signedAt,
        createdAt: loan.createdAt,
        user: loan.user,
        totalRepay: Math.round(totalRepay * 100) / 100,
        nextPayment: nextPending
          ? { amount: nextPending.amount, dueDate: nextPending.dueDate }
          : null,
      };
    });
  }

  async findOneAdmin(loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        amount: true,
        termDays: true,
        dailyRate: true,
        status: true,
        signedAt: true,
        signedIp: true,
        signedUserAgent: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, phone: true },
        },
        scheduleItems: {
          select: { id: true, dueDate: true, amount: true, status: true },
          orderBy: { dueDate: 'asc' },
        },
        paymentRequests: {
          select: { id: true, amount: true, reference: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          select: { id: true, amount: true, date: true },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    const totalRepay = loan.scheduleItems.reduce((sum, s) => sum + s.amount, 0);
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    const nextPending = loan.scheduleItems.find((s) => s.status === 'pending');

    return {
      id: loan.id,
      amount: loan.amount,
      termDays: loan.termDays,
      dailyRate: loan.dailyRate,
      status: loan.status,
      signedAt: loan.signedAt,
      signedIp: loan.signedIp,
      signedUserAgent: loan.signedUserAgent,
      createdAt: loan.createdAt,
      user: loan.user,
      totalRepay: Math.round(totalRepay * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      remaining: Math.round((totalRepay - totalPaid) * 100) / 100,
      schedule: loan.scheduleItems.map((s) => ({
        id: s.id,
        dueDate: s.dueDate,
        amount: s.amount,
        status: s.status,
      })),
      nextPayment: nextPending
        ? { amount: nextPending.amount, dueDate: nextPending.dueDate }
        : null,
      paymentRequests: loan.paymentRequests.map((pr) => ({
        id: pr.id,
        amount: pr.amount,
        reference: pr.reference,
        status: pr.status,
        createdAt: pr.createdAt,
      })),
      payments: loan.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        date: p.date,
      })),
    };
  }

  async updateStatusAdmin(loanId: string, dto: UpdateLoanStatusDto) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundException(`Loan with id ${loanId} not found`);

    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: { status: dto.status },
    });

    this.eventEmitter.emit('loan.status.changed', {
      loanId: updated.id,
      userId: updated.userId,
      status: updated.status,
    });

    return { id: updated.id, status: updated.status };
  }

  async markScheduleItemPaidAdmin(loanId: string, itemId: string, dto: MarkScheduleItemPaidDto) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundException(`Loan with id ${loanId} not found`);

    const item = await this.prisma.paymentScheduleItem.findFirst({
      where: { id: itemId, loanId },
    });
    if (!item) throw new NotFoundException(`Schedule item with id ${itemId} not found`);

    const updated = await this.prisma.paymentScheduleItem.update({
      where: { id: itemId },
      data: { status: dto.status },
    });

    return { id: updated.id, status: updated.status };
  }

  async closeLoanAdmin(loanId: string) {
    const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundException(`Loan with id ${loanId} not found`);

    if (loan.status === 'closed') {
      throw new BadRequestException('Loan is already closed');
    }

    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: { status: 'closed' },
    });

    this.eventEmitter.emit('loan.closed', {
      loanId: updated.id,
      userId: updated.userId,
    });

    return { id: updated.id, status: updated.status };
  }

  async findOneForUser(loanId: string, userId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        userId: true,
        amount: true,
        termDays: true,
        dailyRate: true,
        status: true,
        signedAt: true,
        createdAt: true,
        scheduleItems: {
          select: { id: true, dueDate: true, amount: true, status: true },
          orderBy: { dueDate: 'asc' },
        },
        paymentRequests: {
          select: { id: true, amount: true, reference: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    if (loan.userId !== userId) {
      throw new UnauthorizedException('You can only view your own loans');
    }

    const totalRepay = loan.scheduleItems.reduce((sum, s) => sum + s.amount, 0);
    const nextPending = loan.scheduleItems.find((s) => s.status === 'pending');

    return {
      id: loan.id,
      amount: loan.amount,
      termDays: loan.termDays,
      dailyRate: loan.dailyRate,
      status: loan.status,
      signedAt: loan.signedAt,
      createdAt: loan.createdAt,
      totalRepay: Math.round(totalRepay * 100) / 100,
      schedule: loan.scheduleItems.map((s) => ({
        id: s.id,
        dueDate: s.dueDate,
        amount: s.amount,
        status: s.status,
      })),
      nextPayment: nextPending
        ? { amount: nextPending.amount, dueDate: nextPending.dueDate }
        : null,
      paymentRequests: loan.paymentRequests.map((pr) => ({
        id: pr.id,
        amount: pr.amount,
        reference: pr.reference,
        status: pr.status,
        createdAt: pr.createdAt,
      })),
    };
  }

  async requestSignOtp(loanId: string, userId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    if (loan.userId !== userId) {
      throw new UnauthorizedException('You can only sign your own loans');
    }

    if (loan.status !== 'pending_signature') {
      throw new BadRequestException('Loan is not pending signature');
    }

    // Get user phone for OTP
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Invalidate any existing unused OTPs for this loan
    await this.prisma.otpCode.updateMany({
      where: {
        userId,
        purpose: 'sign-loan',
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate 6-digit code
    const code = Array.from({ length: OTP_LENGTH }, () =>
      Math.floor(Math.random() * 10),
    ).join('');

    // Set expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Create OTP record
    await this.prisma.otpCode.create({
      data: {
        userId,
        phone: user.phone,
        code,
        purpose: 'sign-loan',
        expiresAt,
      },
    });

    // In real app, send SMS here
    // For mock, return code in response
    return {
      message: 'OTP sent successfully',
      mockOtp: code,
      expiresAt,
    };
  }

  async confirmSign(
    loanId: string,
    userId: string,
    dto: ConfirmSignDto,
    ip: string,
    userAgent: string,
  ) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    if (loan.userId !== userId) {
      throw new UnauthorizedException('You can only sign your own loans');
    }

    if (loan.status !== 'pending_signature') {
      throw new BadRequestException('Loan is not pending signature');
    }

    // Find valid OTP
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        code: dto.code,
        purpose: 'sign-loan',
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    // Update loan status
    const signedAt = new Date();
    const updatedLoan = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'active',
        signedAt,
        signedIp: ip,
        signedUserAgent: userAgent,
      },
    });

    // Generate payment schedule
    const scheduleItems = this.generatePaymentSchedule(
      loanId,
      loan.amount,
      loan.termDays,
      signedAt,
    );

    await this.prisma.paymentScheduleItem.createMany({
      data: scheduleItems,
    });

    // Emit loan.signed event
    this.eventEmitter.emit('loan.signed', {
      loanId: loan.id,
      userId: loan.userId,
    });

    // Emit loan.schedule.generated event
    this.eventEmitter.emit('loan.schedule.generated', {
      loanId: loan.id,
      userId: loan.userId,
    });

    return {
      id: updatedLoan.id,
      status: updatedLoan.status,
      signedAt: updatedLoan.signedAt,
    };
  }

  private generatePaymentSchedule(
    loanId: string,
    amount: number,
    termDays: number,
    signedAt: Date,
  ) {
    const r = DAILY_RATE;
    const n = termDays;
    const P = amount;

    // Calculate annuity payment
    const factor = Math.pow(1 + r, n);
    const A = (P * (r * factor)) / (factor - 1);
    const paymentAmount = Math.round(A * 100) / 100;

    // Calculate total without rounding for last payment adjustment
    const totalExact = A * n;
    const totalRounded = paymentAmount * (n - 1);

    const items: Array<{
      loanId: string;
      dueDate: Date;
      amount: number;
      status: string;
    }> = [];
    const startDate = new Date(signedAt);

    for (let i = 0; i < n; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + i);

      // Last payment gets the remainder to avoid rounding error
      const itemAmount =
        i === n - 1
          ? Math.round((totalExact - totalRounded) * 100) / 100
          : paymentAmount;

      items.push({
        loanId,
        dueDate,
        amount: itemAmount,
        status: 'pending',
      });
    }

    return items;
  }
}
