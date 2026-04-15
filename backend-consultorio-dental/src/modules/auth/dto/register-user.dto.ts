import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto';

// Omitimos el campo 'rol' por seguridad. El cliente web NO puede enviarlo.
export class RegisterUserDto extends OmitType(CreateUserDto, ['rol'] as const) {}
