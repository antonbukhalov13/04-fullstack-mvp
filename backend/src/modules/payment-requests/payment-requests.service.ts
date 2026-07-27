import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { QueryPaymentRequestsDto } from './dto/query-payment-requests.dto';

@Injectable()
export class PaymentRequestsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(loanId: string, userId: string, dto: CreatePaymentRequestDto) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    if (loan.userId !== userId) {
      throw new BadRequestException('You can only create payment requests for your own loans');
    }

    if (loan.status !== 'active') {
      throw new BadRequestException('Loan must be active to create a payment request');
    }

    const paymentRequest = await this.prisma.paymentRequest.create({
      data: {
        loanId,
        userId,
        amount: dto.amount,
        reference: dto.reference,
        status: 'pending',
      },
    });

    this.eventEmitter.emit('payment-request.created', {
      paymentRequestId: paymentRequest.id,
      loanId,
      userId,
    });

    return paymentRequest;
  }

  async findAll(query: QueryPaymentRequestsDto, take: number, skip: number) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.paymentRequest.findMany({
        where,
        include: {
          loan: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              phone: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.paymentRequest.count({ where }),
    ]);

    return { data: items, total, limit: take, offset: skip };
  }

  async findUserPaymentRequests(userId: string) {
    return this.prisma.paymentRequest.findMany({
      where: { userId },
      include: {
        loan: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
