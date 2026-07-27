import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
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
import { QueryAdminLoansDto } from './dto/query-admin-loans.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto';
import { MarkScheduleItemPaidDto } from './dto/mark-schedule-item-paid.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('loans')
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly paymentRequestsService: PaymentRequestsService,
  ) {}

  @Get('overdue')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  async findOverdueItemsAdmin() {
    return this.loansService.findAllOverdueItemsAdmin();
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  async findAllAdmin(@Query() query: QueryAdminLoansDto) {
    return this.loansService.findAllAdmin(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.loansService.findByUserId(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.loansService.findOneForUser(id, user.id);
  }

  @Patch(':id/status')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @HttpCode(HttpStatus.OK)
  async updateStatusAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateLoanStatusDto,
  ) {
    return this.loansService.updateStatusAdmin(id, dto);
  }

  @Patch(':id/schedule/:itemId')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @HttpCode(HttpStatus.OK)
  async markScheduleItemPaidAdmin(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: MarkScheduleItemPaidDto,
  ) {
    return this.loansService.markScheduleItemPaidAdmin(id, itemId, dto);
  }

  @Post(':id/close')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @HttpCode(HttpStatus.OK)
  async closeLoanAdmin(@Param('id') id: string) {
    return this.loansService.closeLoanAdmin(id);
  }

  @Post(':id/request-sign-otp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestSignOtp(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.loansService.requestSignOtp(id, user.id);
  }

  @Post(':id/confirm-sign')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPaymentRequest(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePaymentRequestDto,
  ) {
    return this.paymentRequestsService.create(id, user.id, dto);
  }
}
