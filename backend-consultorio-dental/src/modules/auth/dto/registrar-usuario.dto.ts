import { OmitType } from '@nestjs/mapped-types';
import { CrearUsuarioDto } from '../../usuarios/dto/CrearUsuarioDto';

// Omitimos el campo 'rol' por seguridad. El cliente web NO puede enviarlo.
export class RegistrarUsuarioDto extends OmitType(CrearUsuarioDto, ['rol'] as const) {}
