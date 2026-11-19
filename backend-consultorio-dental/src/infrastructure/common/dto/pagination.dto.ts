import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(MAX_LIMIT, { message: `El límite máximo es ${MAX_LIMIT}` })
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Normaliza page/limit y calcula skip/take para Prisma. */
export function resolvePagination(filters?: PaginationDto) {
  const page = filters?.page ?? DEFAULT_PAGE;
  const limit = Math.min(filters?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit, take: limit };
}
