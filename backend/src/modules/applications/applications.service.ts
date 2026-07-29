import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

const INDIVIDUAL_LIMITS = {
  minAmount: 500,
  maxAmount: 50000,
  minTerm: 7,
  maxTerm: 90,
};

const BUSINESS_LIMITS = {
  minAmount: 30000,
  maxAmount: 500000,
  minTerm: 30,
  maxTerm: 365,
};

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateApplicationDto) {
    this.validateApplication(dto);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    const userName = dto.applicantType === 'individual'
      ? [dto.firstName, dto.lastName].filter(Boolean).join(' ')
      : dto.companyName;

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone: dto.phone, name: userName || null },
      });
    } else if (!user.name && userName) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name: userName },
      });
    }

    // Create application
    const application = await this.prisma.application.create({
      data: {
        userId: user.id,
        applicantType: dto.applicantType,
        amount: dto.amount,
        termDays: dto.termDays,
        status: 'new',
        // Individual fields
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        // Business fields
        companyName: dto.companyName,
        registrationNumber: dto.registrationNumber,
        companyEmail: dto.companyEmail,
        companyPhone: dto.companyPhone,
      },
    });

    // Update file attachments if provided
    if (dto.fileAttachmentIds && dto.fileAttachmentIds.length > 0) {
      await this.prisma.fileAttachment.updateMany({
        where: {
          id: { in: dto.fileAttachmentIds },
        },
        data: {
          ownerType: 'application',
          ownerId: application.id,
        },
      });
    }

    // Emit application.created event
    this.eventEmitter.emit('application.created', {
      applicationId: application.id,
      userId: user.id,
      status: application.status,
    });

    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
    };
  }

  async findByUserId(userId: string, take: number, skip: number) {
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          applicantType: true,
          amount: true,
          termDays: true,
          status: true,
          firstName: true,
          lastName: true,
          companyName: true,
          createdAt: true,
        },
      }),
      this.prisma.application.count({ where }),
    ]);
    return { data: items, total, limit: take, offset: skip };
  }

  async findAll(query: QueryApplicationsDto, take: number, skip: number) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.phone) {
      where.user = { phone: { contains: query.phone } };
    }

    if (query.firstName) {
      where.firstName = { contains: query.firstName, mode: 'insensitive' };
    }

    if (query.lastName) {
      where.lastName = { contains: query.lastName, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { user: { phone: { contains: query.search } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take,
        skip,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data: items, total, limit: take, offset: skip };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
        loans: true,
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    return application;
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { loans: true },
    });

    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(application.status, dto.status);

    // Check for conflicts
    if (dto.status === 'approved') {
      if (application.status === 'rejected') {
        throw new ConflictException('Cannot approve a rejected application');
      }
      if (application.loans.length > 0) {
        throw new ConflictException('Loan already exists for this application');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.application.update({
        where: { id },
        data: {
          status: dto.status as any,
          comment: dto.comment || application.comment,
        },
      });

      // Create loan when approved
      let loan: any = null;
      if (dto.status === 'approved') {
        loan = await tx.loan.create({
          data: {
            applicationId: application.id,
            userId: application.userId,
            amount: application.amount,
            dailyRate: 0.008,
            termDays: application.termDays,
            status: 'pending_signature',
          },
        });
      }

      return { updatedApplication, loan };
    });

    // Emit application.status.changed event (outside transaction)
    this.eventEmitter.emit('application.status.changed', {
      applicationId: application.id,
      userId: application.userId,
      previousStatus: application.status,
      newStatus: dto.status,
    });

    // Emit loan.created event (outside transaction)
    if (result.loan) {
      this.eventEmitter.emit('loan.created', {
        loanId: result.loan.id,
        userId: application.userId,
      });
    }

    return {
      id: result.updatedApplication.id,
      status: result.updatedApplication.status,
      comment: result.updatedApplication.comment,
      loan: result.loan,
    };
  }

  async addComment(id: string, dto: CreateCommentDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: {
        comment: dto.comment,
      },
    });

    return {
      id: updatedApplication.id,
      comment: updatedApplication.comment,
      updatedAt: new Date(),
    };
  }

  private validateApplication(dto: CreateApplicationDto) {
    const limits =
      dto.applicantType === 'individual' ? INDIVIDUAL_LIMITS : BUSINESS_LIMITS;

    if (dto.amount < limits.minAmount || dto.amount > limits.maxAmount) {
      throw new BadRequestException(
        `Amount must be between ${limits.minAmount} and ${limits.maxAmount} EUR for ${dto.applicantType} applications`,
      );
    }

    if (dto.termDays < limits.minTerm || dto.termDays > limits.maxTerm) {
      throw new BadRequestException(
        `Term must be between ${limits.minTerm} and ${limits.maxTerm} days for ${dto.applicantType} applications`,
      );
    }

    // Validate required fields based on type
    if (dto.applicantType === 'individual') {
      if (!dto.firstName || !dto.lastName) {
        throw new BadRequestException(
          'First name and last name are required for individual applications',
        );
      }
    }

    if (dto.applicantType === 'business') {
      if (!dto.companyName) {
        throw new BadRequestException(
          'Company name is required for business applications',
        );
      }
      if (!dto.registrationNumber) {
        throw new BadRequestException(
          'Registration number is required for business applications',
        );
      }
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      new: ['in_progress'],
      in_progress: ['approved', 'rejected'],
      approved: [],
      rejected: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`,
      );
    }
  }
}
