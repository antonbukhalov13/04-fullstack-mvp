import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryAdminLoansDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'closed', 'pending_signature', 'overdue', 'default'])
  status?: string;
}
