import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';

export class GetNotificationsDto extends PaginationDto {
  /** true = solo leidas, false = solo no leidas, ausente = todas. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'El filtro de leídas debe ser true o false' })
  read?: boolean;
}
