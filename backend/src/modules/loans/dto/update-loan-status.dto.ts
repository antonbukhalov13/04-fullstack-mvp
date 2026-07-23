import { IsString, IsIn } from 'class-validator';

export class UpdateLoanStatusDto {
  @IsString()
  @IsIn(['active', 'closed', 'overdue', 'default'])
  status: string;
}
