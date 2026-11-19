import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { promises as fs, createReadStream } from 'fs';
import type { ReadStream } from 'fs';
import * as path from 'path';
import {
  IMAGE_CONTENT_TYPES,
  ImageExtension,
  UploadedImageFile,
  validateImageFile,
} from './image-validation';

/**
 * Carpetas de almacenamiento. Todas viven bajo STORAGE_DIR y NINGUNA se sirve
 * como estatico: los archivos solo salen por endpoints del backend.
 * - private/consultations: imagenes clinicas (solo con autorizacion).
 * - public/services, public/offers: imagenes del catalogo publico.
 */
export type StorageArea = 'consultations' | 'services' | 'offers';

const AREA_PATH: Record<StorageArea, string[]> = {
  consultations: ['private', 'consultations'],
  services: ['public', 'services'],
  offers: ['public', 'offers'],
};

/** Nombre generado por el servidor: 32 hex + extension permitida. */
const STORED_NAME = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

export function resolveStorageRoot() {
  return path.resolve(
    process.env.STORAGE_DIR || path.join(process.cwd(), 'storage'),
  );
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  private areaDir(area: StorageArea) {
    return path.join(resolveStorageRoot(), ...AREA_PATH[area]);
  }

  /**
   * Ruta absoluta de un archivo almacenado. Rechaza cualquier nombre que no
   * tenga la forma generada por el servidor (evita path traversal aunque el
   * valor de la BD estuviera manipulado) y comprueba que quede dentro del area.
   */
  resolvePath(area: StorageArea, storedName: string) {
    if (typeof storedName !== 'string' || !STORED_NAME.test(storedName)) {
      throw new NotFoundException('El archivo no existe');
    }
    const dir = this.areaDir(area);
    const full = path.resolve(dir, storedName);
    if (path.dirname(full) !== dir) {
      throw new NotFoundException('El archivo no existe');
    }
    return full;
  }

  /** Valida y guarda; devuelve el nombre aleatorio generado (nunca el original). */
  async save(area: StorageArea, file: UploadedImageFile): Promise<string> {
    const ext = validateImageFile(file);
    const name = `${randomBytes(16).toString('hex')}.${ext}`;
    const full = this.resolvePath(area, name);

    await fs.mkdir(path.dirname(full), { recursive: true });
    // 'wx': nunca sobrescribe un archivo existente
    await fs.writeFile(full, file.buffer!, { flag: 'wx', mode: 0o640 });

    return name;
  }

  /** Borra sin fallar si ya no existe. Nunca lanza ni registra rutas. */
  async remove(area: StorageArea, storedName: string | null | undefined) {
    if (!storedName) return;
    try {
      await fs.unlink(this.resolvePath(area, storedName));
    } catch (error) {
      const missing =
        error instanceof NotFoundException ||
        (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (!missing) {
        this.logger.warn('No se pudo eliminar un archivo almacenado');
      }
    }
  }

  async removeMany(area: StorageArea, storedNames: string[]) {
    await Promise.all(storedNames.map((name) => this.remove(area, name)));
  }

  /** Abre el archivo para servirlo. 404 si falta en disco. */
  async open(
    area: StorageArea,
    storedName: string,
  ): Promise<{ stream: ReadStream; size: number; contentType: string }> {
    const full = this.resolvePath(area, storedName);
    let size: number;
    try {
      size = (await fs.stat(full)).size;
    } catch {
      throw new NotFoundException('El archivo no existe');
    }
    const ext = path.extname(storedName).slice(1) as ImageExtension;

    return {
      stream: createReadStream(full),
      size,
      // Fijo segun la extension que decidio el contenido al subir
      contentType: IMAGE_CONTENT_TYPES[ext],
    };
  }
}
