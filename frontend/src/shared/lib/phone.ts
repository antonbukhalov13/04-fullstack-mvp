export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export const PHONE_ERROR = 'Введите действительный номер телефона';

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}
