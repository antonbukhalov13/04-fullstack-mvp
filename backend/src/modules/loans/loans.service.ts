import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfirmSignDto } from './dto/confirm-sign.dto';

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;
const DAILY_RATE = 0.008;

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

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
