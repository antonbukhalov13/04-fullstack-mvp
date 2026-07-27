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

  async findAll(entityType?: string, entityId?: string, take?: number, skip?: number) {
    const where: Record<string, any> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const effectiveTake = take ?? 20;
    const effectiveSkip = skip ?? 0;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: effectiveTake,
        skip: effectiveSkip,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: items, total, limit: effectiveTake, offset: effectiveSkip };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
