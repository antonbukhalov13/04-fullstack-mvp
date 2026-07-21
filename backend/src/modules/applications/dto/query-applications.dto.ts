import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryApplicationsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['new', 'in_progress', 'approved', 'rejected'])
  status?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
