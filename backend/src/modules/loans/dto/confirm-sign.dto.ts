import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ConfirmSignDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
