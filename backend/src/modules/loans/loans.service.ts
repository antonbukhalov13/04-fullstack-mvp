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
    const updatedLoan = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'active',
        signedAt: new Date(),
        signedIp: ip,
        signedUserAgent: userAgent,
      },
    });

    // Emit loan.signed event
    this.eventEmitter.emit('loan.signed', {
      loanId: loan.id,
      userId: loan.userId,
    });

    return {
      id: updatedLoan.id,
      status: updatedLoan.status,
      signedAt: updatedLoan.signedAt,
    };
  }
}
