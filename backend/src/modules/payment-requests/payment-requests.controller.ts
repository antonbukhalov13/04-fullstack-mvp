import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentRequestsService } from './payment-requests.service';
import { QueryPaymentRequestsDto } from './dto/query-payment-requests.dto';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('payment-requests')
export class PaymentRequestsController {
  constructor(private readonly paymentRequestsService: PaymentRequestsService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  async findAll(
    @Query() query: QueryPaymentRequestsDto,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = Number(offset) || 0;
    return this.paymentRequestsService.findAll(query, take, skip);
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  async findUserPaymentRequests(@CurrentUser() user: CurrentUserPayload) {
    return this.paymentRequestsService.findUserPaymentRequests(user.id);
  }
}
