import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @MinLength(1)
  reference: string;
}
