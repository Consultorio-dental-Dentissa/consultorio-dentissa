import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateUserStatusDto {
  @IsDefined({ message: 'El estado es requerido' })
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  estado!: boolean;
}
