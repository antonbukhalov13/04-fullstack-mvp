import { IsString, IsIn } from 'class-validator';

export class DecidePaymentRequestDto {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}
