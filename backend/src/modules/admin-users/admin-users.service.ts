import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async findAll() {
    const data = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, login: true, role: true, createdAt: true },
    });
    return { data };
  }

  async create(dto: CreateAdminUserDto, actorId: string) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { login: dto.login },
    });
    if (existing) {
      throw new ConflictException('Логин уже занят');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.adminUser.create({
      data: { login: dto.login, passwordHash, role: dto.role },
      select: { id: true, login: true, role: true, createdAt: true },
    });

    await this.auditLogService.log({
      entityType: 'admin_user',
      entityId: user.id,
      action: 'admin_user.created',
      after: { login: user.login, role: user.role },
      actorId,
      actorType: 'admin',
    });

    return user;
  }

  async update(id: string, dto: UpdateAdminUserDto, actorId: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Администратор не найден');
    }

    const isSelf = user.id === actorId;
    if (dto.role && isSelf && dto.role !== user.role) {
      throw new ForbiddenException('Нельзя изменить свою роль');
    }

    const data: { passwordHash?: string; role?: 'admin' | 'operator' } = {};
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.role && dto.role !== user.role) {
      data.role = dto.role;
    }

    if (data.role === 'operator') {
      const adminCount = await this.prisma.adminUser.count({
        where: { role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new ConflictException('Нельзя понизить последнего администратора');
      }
    }

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data,
      select: { id: true, login: true, role: true, createdAt: true },
    });

    await this.auditLogService.log({
      entityType: 'admin_user',
      entityId: id,
      action: 'admin_user.updated',
      before: { login: user.login, role: user.role },
      after: { login: updated.login, role: updated.role },
      actorId,
      actorType: 'admin',
    });

    return updated;
  }

  async remove(id: string, actorId: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Администратор не найден');
    }
    if (user.id === actorId) {
      throw new ForbiddenException('Нельзя удалить свою учётную запись');
    }
    if (user.role === 'admin') {
      const adminCount = await this.prisma.adminUser.count({
        where: { role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new ConflictException('Нельзя удалить последнего администратора');
      }
    }

    await this.prisma.adminUser.delete({ where: { id } });

    await this.auditLogService.log({
      entityType: 'admin_user',
      entityId: id,
      action: 'admin_user.deleted',
      before: { login: user.login, role: user.role },
      actorId,
      actorType: 'admin',
    });

    return { success: true };
  }
}
