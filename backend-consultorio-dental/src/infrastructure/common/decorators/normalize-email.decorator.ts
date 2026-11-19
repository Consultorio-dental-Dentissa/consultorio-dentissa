import { Transform } from 'class-transformer';

/** Normaliza el correo (trim + minusculas) antes de validarlo. */
export const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
