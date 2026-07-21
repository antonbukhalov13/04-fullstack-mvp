import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';

export interface AdminJwtPayload {
  sub: string;
  login: string;
  role: 'admin' | 'operator';
}

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: AdminLoginDto) {
    const { login, password } = dto;

    const adminUser = await this.prisma.adminUser.findUnique({
      where: { login },
    });

    if (!adminUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      adminUser.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: AdminJwtPayload = {
      sub: adminUser.id,
      login: adminUser.login,
      role: adminUser.role as 'admin' | 'operator',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: adminUser.id,
        login: adminUser.login,
        role: adminUser.role,
      },
    };
  }
}
