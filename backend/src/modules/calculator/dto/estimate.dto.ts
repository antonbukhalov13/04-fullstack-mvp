import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class EstimateDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(365)
  termDays: number;
}
