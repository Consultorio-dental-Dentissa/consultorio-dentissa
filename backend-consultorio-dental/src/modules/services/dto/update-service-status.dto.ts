import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateServiceStatusDto {
  @IsDefined({ message: 'El estatus es requerido' })
  @IsBoolean({ message: 'El estatus debe ser verdadero o falso' })
  status!: boolean;
}
