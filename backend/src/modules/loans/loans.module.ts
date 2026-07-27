import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { PaymentRequestsModule } from '../payment-requests/payment-requests.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentRequestsModule, PaymentsModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
