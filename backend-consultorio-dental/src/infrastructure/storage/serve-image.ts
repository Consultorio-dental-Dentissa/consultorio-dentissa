import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { FileStorageService, StorageArea } from './file-storage.service';

/**
 * Sirve una imagen almacenada con cabeceras fijas: el content-type sale de la
 * extension decidida al subir (nunca del cliente) y se desactiva el sniffing.
 * La autorizacion se comprueba ANTES de llamar a esta funcion.
 */
export async function serveImage(
  storage: FileStorageService,
  area: StorageArea,
  storedName: string,
  res: Response,
  visibility: 'private' | 'public',
) {
  const file = await storage.open(area, storedName);

  res.set({
    'Content-Type': file.contentType,
    'Content-Length': String(file.size),
    'Content-Disposition': 'inline',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'",
    'Cache-Control':
      visibility === 'private' ? 'private, no-store' : 'public, max-age=300',
  });

  return new StreamableFile(file.stream);
}
