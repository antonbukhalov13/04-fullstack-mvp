import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { LoansService } from './loans.service';
import { PaymentRequestsService } from '../payment-requests/payment-requests.service';
import { ConfirmSignDto } from './dto/confirm-sign.dto';
import { CreatePaymentRequestDto } from '../payment-requests/dto/create-payment-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly paymentRequestsService: PaymentRequestsService,
  ) {}

  @Get('me')
  async findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.loansService.findByUserId(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.loansService.findOneForUser(id, user.id);
  }

  @Post(':id/request-sign-otp')
  @HttpCode(HttpStatus.OK)
  async requestSignOtp(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.loansService.requestSignOtp(id, user.id);
  }

  @Post(':id/confirm-sign')
  @HttpCode(HttpStatus.OK)
  async confirmSign(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ConfirmSignDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.loansService.confirmSign(id, user.id, dto, ip, userAgent);
  }

  @Post(':id/payment-requests')
  @HttpCode(HttpStatus.CREATED)
  async createPaymentRequest(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePaymentRequestDto,
  ) {
    return this.paymentRequestsService.create(id, user.id, dto);
  }
}
