import {
  Controller,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { DecidePaymentRequestDto } from './dto/decide-payment-request.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'operator')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Patch('payment-requests/:id')
  @HttpCode(HttpStatus.OK)
  async decidePaymentRequest(
    @Param('id') id: string,
    @Body() dto: DecidePaymentRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.paymentsService.decidePaymentRequest(id, dto, user.id);
  }

  @Post('loans/:id/payments')
  @HttpCode(HttpStatus.CREATED)
  async recordDirectPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.paymentsService.recordDirectPayment(id, dto, user.id);
  }
}
