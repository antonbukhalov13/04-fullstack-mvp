import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryPaymentRequestsDto {
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: string;
}
