import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Введите действительный номер телефона',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
