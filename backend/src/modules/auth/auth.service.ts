import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    const { phone } = dto;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone },
      });
    }

    // Invalidate any existing unused OTPs for this phone
    await this.prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        purpose: 'login',
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
        userId: user.id,
        phone: user.phone,
        code,
        purpose: 'login',
        expiresAt,
      },
    });

    // In real app, send SMS here
    // For mock, return code in response
    return {
      message: 'OTP sent successfully',
      // Mock: return code in response for testing
      mockOtp: code,
      expiresAt,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, code } = dto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Find valid OTP
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        purpose: 'login',
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
      throw new BadRequestException('Неверный или просроченный код');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    // Generate JWT
    const payload = {
      sub: user.id,
      phone: user.phone,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    };
  }
}
