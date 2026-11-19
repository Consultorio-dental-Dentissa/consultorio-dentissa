import { BadRequestException } from '@nestjs/common';

/** Archivo recibido por multer (memoryStorage). Solo los campos que usamos. */
export interface UploadedImageFile {
  buffer?: Buffer;
  size?: number;
  mimetype?: string;
  /** Nombre original: NUNCA se usa para guardar ni para decidir el tipo. */
  originalname?: string;
}

export type ImageExtension = 'jpg' | 'png' | 'webp';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES_PER_ENTITY = 5;

export const IMAGE_CONTENT_TYPES: Record<ImageExtension, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const MIME_TO_EXTENSION: Record<string, ImageExtension> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/** Detecta el formato real por magic bytes. null si no es jpeg/png/webp. */
export function detectImageExtension(buffer: Buffer): ImageExtension | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpg';
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return 'png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

/**
 * Valida un archivo de imagen: tamano, mime declarado Y contenido real
 * (magic bytes). Devuelve la extension decidida por el contenido.
 */
export function validateImageFile(file: UploadedImageFile): ImageExtension {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new BadRequestException('El archivo está vacío o no es válido');
  }
  if (file.buffer.length > MAX_IMAGE_BYTES) {
    throw new BadRequestException(
      `Cada imagen debe pesar como máximo ${MAX_IMAGE_BYTES / (1024 * 1024)} MB`,
    );
  }

  const declared = MIME_TO_EXTENSION[(file.mimetype ?? '').toLowerCase()];
  if (!declared) {
    throw new BadRequestException(
      'Formato no permitido. Usa imágenes JPEG, PNG o WebP',
    );
  }

  const real = detectImageExtension(file.buffer);
  if (!real || real !== declared) {
    throw new BadRequestException(
      'El contenido del archivo no corresponde a una imagen JPEG, PNG o WebP válida',
    );
  }

  return real;
}
