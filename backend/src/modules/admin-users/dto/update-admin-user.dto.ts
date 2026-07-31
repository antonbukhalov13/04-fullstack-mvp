import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(72, { message: 'Пароль должен содержать максимум 72 символа' })
  password?: string;

  @IsOptional()
  @IsIn(['admin', 'operator'], { message: 'Роль должна быть admin или operator' })
  role?: 'admin' | 'operator';
}
