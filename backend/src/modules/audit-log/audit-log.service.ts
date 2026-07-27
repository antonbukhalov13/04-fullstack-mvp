import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateAuditLogDto {
  entityType: string;
  entityId: string;
  action: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  actorId: string;
  actorType: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        action: dto.action,
        before: dto.before ?? undefined,
        after: dto.after ?? undefined,
        actorId: dto.actorId,
        actorType: dto.actorType,
      },
    });
  }

  async findAll(entityType?: string, entityId?: string) {
    const where: Record<string, any> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
