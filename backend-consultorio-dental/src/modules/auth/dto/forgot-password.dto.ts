import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';
import { NormalizeEmail } from '../../../infrastructure/common/decorators/normalize-email.decorator';

export class ForgotPasswordDto {
  @IsDefined({ message: 'El correo es requerido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @NormalizeEmail()
  @IsEmail({}, { message: 'El correo no esta en formato valido' })
  email!: string;
}
