import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { normalizePhone } from './normalize-phone.decorator';
import { CreateUserDto } from '../../../modules/users/dto/create-user.dto';
import { RegisterUserDto } from '../../../modules/auth/dto/register-user.dto';

describe('normalizePhone', () => {
  it('deja solo digitos y un + inicial', () => {
    expect(normalizePhone(' (55) 1234-5678 ')).toBe('5512345678');
    expect(normalizePhone('+52 55.1234 5678')).toBe('+525512345678');
    expect(normalizePhone('55+12')).toBe('5512');
    expect(normalizePhone('abc')).toBe('');
  });

  it('no toca valores que no son texto', () => {
    expect(normalizePhone(undefined)).toBeUndefined();
    expect(normalizePhone(5)).toBe(5);
  });

  it('se aplica en el alta de usuario y en el registro publico', () => {
    const body = { phone: '(55) 1111-2222', patient: undefined };
    expect(plainToInstance(CreateUserDto, body).phone).toBe('5511112222');
    expect(plainToInstance(RegisterUserDto, body).phone).toBe('5511112222');
  });
});
