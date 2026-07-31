import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateAdminUserDto {
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин обязателен' })
  @MinLength(3, { message: 'Логин должен содержать минимум 3 символа' })
  @MaxLength(50, { message: 'Логин должен содержать максимум 50 символов' })
  login: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(72, { message: 'Пароль должен содержать максимум 72 символа' })
  password: string;

  @IsIn(['admin', 'operator'], { message: 'Роль должна быть admin или operator' })
  role: 'admin' | 'operator';
}
