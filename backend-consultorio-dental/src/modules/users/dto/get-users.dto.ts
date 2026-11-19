import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../enums/rol.enum';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';

export class GetUsersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role, {
    message: `El rol debe ser de: ${Object.values(Role).join(', ')}`,
  })
  role?: Role;

  @IsOptional()
  @Transform(({ value }) => value === 'ACTIVO')
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @MaxLength(100, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  search?: string;
}
