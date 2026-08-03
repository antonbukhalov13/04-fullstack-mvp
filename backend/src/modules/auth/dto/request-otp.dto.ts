import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Введите действительный номер телефона',
  })
  phone: string;
}
