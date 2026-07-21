import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

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
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApplicationDto) {
    this.validateApplication(dto);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone: dto.phone },
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

    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
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
}
