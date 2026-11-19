/**
 * Transforma el filtro de estado de la query: ACTIVO -> true, INACTIVO -> false,
 * ausente -> undefined. Cualquier otro valor se deja tal cual para que
 * @IsBoolean responda 400 en lugar de interpretarlo en silencio.
 */
export function parseStatusFilter({ value }: { value: unknown }): unknown {
  if (value === undefined || value === '') return undefined;
  if (value === 'ACTIVO') return true;
  if (value === 'INACTIVO') return false;
  return value;
}

export const STATUS_FILTER_MESSAGE = 'El estado debe ser ACTIVO o INACTIVO';
