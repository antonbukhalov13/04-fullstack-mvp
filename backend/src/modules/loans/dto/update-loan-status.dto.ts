import { IsString, IsIn } from 'class-validator';

export class UpdateLoanStatusDto {
  @IsString()
  @IsIn(['active', 'closed'])
  status: string;
}
