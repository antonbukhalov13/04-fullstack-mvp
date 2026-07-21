import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { PaymentRequestsModule } from '../payment-requests/payment-requests.module';

@Module({
  imports: [PaymentRequestsModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
