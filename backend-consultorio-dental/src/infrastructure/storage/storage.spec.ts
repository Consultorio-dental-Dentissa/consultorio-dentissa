import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { mkdtempSync, existsSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { FileStorageService } from './file-storage.service';
import {
  MAX_IMAGE_BYTES,
  detectImageExtension,
  validateImageFile,
} from './image-validation';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';

const JPEG = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(32, 1),
]);
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32, 2),
]);
const WEBP = Buffer.concat([
  Buffer.from('RIFF', 'latin1'),
  Buffer.from([0x10, 0, 0, 0]),
  Buffer.from('WEBP', 'latin1'),
  Buffer.alloc(16, 3),
]);

describe('validateImageFile', () => {
  it('acepta jpeg, png y webp reales y decide la extension por el contenido', () => {
    expect(validateImageFile({ buffer: JPEG, mimetype: 'image/jpeg' })).toBe(
      'jpg',
    );
    expect(validateImageFile({ buffer: PNG, mimetype: 'image/png' })).toBe(
      'png',
    );
    expect(validateImageFile({ buffer: WEBP, mimetype: 'image/webp' })).toBe(
      'webp',
    );
  });

  it('rechaza una extension falsa: texto/script con nombre .png y mime image/png', () => {
    const fake = {
      buffer: Buffer.from('<?php echo 1; ?> esto no es una imagen'),
      mimetype: 'image/png',
      originalname: 'foto.png',
    };
    expect(() => validateImageFile(fake)).toThrow(BadRequestException);
  });

  it('rechaza si el mime declarado no coincide con el contenido real', () => {
    expect(() =>
      validateImageFile({ buffer: PNG, mimetype: 'image/jpeg' }),
    ).toThrow(BadRequestException);
  });

  it('rechaza formatos no permitidos (svg, gif, pdf) aunque el contenido parezca valido', () => {
    for (const mimetype of ['image/svg+xml', 'image/gif', 'application/pdf']) {
      expect(() => validateImageFile({ buffer: PNG, mimetype })).toThrow(
        BadRequestException,
      );
    }
  });

  it('rechaza archivos vacios o demasiado grandes', () => {
    expect(() =>
      validateImageFile({ buffer: Buffer.alloc(0), mimetype: 'image/png' }),
    ).toThrow(BadRequestException);
    const big = Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES)]);
    expect(() =>
      validateImageFile({ buffer: big, mimetype: 'image/png' }),
    ).toThrow(BadRequestException);
  });

  it('detectImageExtension devuelve null para contenido desconocido', () => {
    expect(detectImageExtension(Buffer.from('GIF89a....'))).toBeNull();
  });
});

describe('FileStorageService', () => {
  let root: string;
  let storage: FileStorageService;
  const previousEnv = process.env.STORAGE_DIR;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'dentissa-storage-'));
    process.env.STORAGE_DIR = root;
    storage = new FileStorageService();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    if (previousEnv === undefined) delete process.env.STORAGE_DIR;
    else process.env.STORAGE_DIR = previousEnv;
  });

  it('guarda con nombre aleatorio (nunca el original) en la carpeta privada', async () => {
    const name = await storage.save('consultations', {
      buffer: PNG,
      mimetype: 'image/png',
      originalname: '../../etc/passwd.png',
    });

    expect(name).toMatch(/^[a-f0-9]{32}\.png$/);
    expect(name).not.toContain('passwd');
    const full = path.join(root, 'private', 'consultations', name);
    expect(existsSync(full)).toBe(true);
    expect(readFileSync(full).equals(PNG)).toBe(true);
  });

  it('dos subidas del mismo archivo generan nombres distintos', async () => {
    const file = { buffer: JPEG, mimetype: 'image/jpeg' };
    const a = await storage.save('services', file);
    const b = await storage.save('services', file);
    expect(a).not.toBe(b);
  });

  it('no guarda nada si el archivo es invalido', async () => {
    await expect(
      storage.save('consultations', {
        buffer: Buffer.from('texto'),
        mimetype: 'image/png',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(existsSync(path.join(root, 'private'))).toBe(false);
  });

  it('bloquea path traversal y nombres que no genero el servidor', () => {
    const malicious = [
      '../secret.png',
      '..\\secret.png',
      '../../private/consultations/' + 'a'.repeat(32) + '.png',
      '/etc/passwd',
      'C:\\Windows\\win.ini',
      'a'.repeat(32) + '.png/../../x.png',
      'a'.repeat(32) + '.svg',
      'foto.png',
      '',
    ];
    for (const name of malicious) {
      expect(() => storage.resolvePath('consultations', name)).toThrow(
        NotFoundException,
      );
    }
  });

  it('las rutas resueltas quedan siempre dentro del area', () => {
    const valid = 'a'.repeat(32) + '.jpg';
    const full = storage.resolvePath('consultations', valid);
    expect(full.startsWith(path.join(root, 'private', 'consultations'))).toBe(
      true,
    );
  });

  it('remove borra el archivo y no falla si ya no existe', async () => {
    const name = await storage.save('offers', {
      buffer: WEBP,
      mimetype: 'image/webp',
    });
    await storage.remove('offers', name);
    expect(existsSync(path.join(root, 'public', 'offers', name))).toBe(false);
    await expect(storage.remove('offers', name)).resolves.toBeUndefined();
    await expect(storage.remove('offers', '../x')).resolves.toBeUndefined();
  });

  it('open devuelve content-type fijo segun la extension y 404 si falta', async () => {
    const name = await storage.save('services', {
      buffer: PNG,
      mimetype: 'image/png',
    });
    const file = await storage.open('services', name);
    expect(file.contentType).toBe('image/png');
    expect(file.size).toBe(PNG.length);
    file.stream.destroy();

    await expect(
      storage.open('services', 'b'.repeat(32) + '.png'),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('TransformResponseInterceptor con archivos', () => {
  it('no envuelve un StreamableFile en ApiResponse, pero si el resto', async () => {
    const interceptor = new TransformResponseInterceptor();
    const file = new StreamableFile(Buffer.from('x'));

    const streamed = await lastValueFrom(
      interceptor.intercept({} as any, { handle: () => of(file) }),
    );
    expect(streamed).toBe(file);

    const wrapped = await lastValueFrom(
      interceptor.intercept({} as any, { handle: () => of({ a: 1 }) }),
    );
    expect(wrapped).toEqual({ success: true, message: 'OK', data: { a: 1 } });
  });
});
