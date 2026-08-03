import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { PaymentRequestsModule } from '../payment-requests/payment-requests.module';
import { PaymentsModule } from '../payments/payments.module';
import { OverdueModule } from '../overdue/overdue.module';

@Module({
  imports: [PaymentRequestsModule, PaymentsModule, OverdueModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
