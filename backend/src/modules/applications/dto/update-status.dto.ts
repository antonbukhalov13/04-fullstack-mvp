import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['in_progress', 'approved', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
