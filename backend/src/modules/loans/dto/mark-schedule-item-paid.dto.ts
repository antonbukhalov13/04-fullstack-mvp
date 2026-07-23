import { IsString, IsIn } from 'class-validator';

export class MarkScheduleItemPaidDto {
  @IsString()
  @IsIn(['paid', 'overdue', 'pending'])
  status: string;
}
