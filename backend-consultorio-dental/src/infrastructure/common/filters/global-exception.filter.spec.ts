import {
  ArgumentsHost,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GlobalExceptionFilter } from './global-exception.filter';

function run(exception: unknown) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  new GlobalExceptionFilter().catch(exception, host);

  return { status: status.mock.calls[0][0], body: json.mock.calls[0][0] };
}

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: 'test',
    meta,
  });

describe('GlobalExceptionFilter', () => {
  it('P2025 -> 404', () => {
    const { status, body } = run(prismaError('P2025'));
    expect(status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('P2002 -> 409', () => {
    expect(run(prismaError('P2002')).status).toBe(409);
  });

  it('P2002 sobre el telefono -> 409 con mensaje claro', () => {
    const { status, body } = run(
      prismaError('P2002', { target: ['users_phone_key'] }),
    );
    expect(status).toBe(409);
    expect(body.message).toBe('Este teléfono ya está registrado');
  });

  it('P2002 sobre el correo -> 409 con mensaje claro', () => {
    const { body } = run(prismaError('P2002', { target: ['email'] }));
    expect(body.message).toBe('Este correo ya está registrado');
  });

  it('P2028 (transaccion vencida) -> 503 "Intenta de nuevo"', () => {
    const { status, body } = run(prismaError('P2028'));
    expect(status).toBe(503);
    expect(body.message).toContain('Intenta de nuevo');
  });

  it('body JSON demasiado grande (body-parser) -> 413', () => {
    const { status, body } = run(
      Object.assign(new Error('too large'), { type: 'entity.too.large' }),
    );
    expect(status).toBe(413);
    expect(body.message).toBe('El cuerpo de la solicitud es demasiado grande');
  });

  it('HttpException conserva estado y mensaje', () => {
    const { status, body } = run(new NotFoundException('No existe'));
    expect(status).toBe(404);
    expect(body).toMatchObject({ success: false, message: 'No existe' });
  });

  it('errores de validacion devuelven el primer mensaje y la lista', () => {
    const { status, body } = run(new BadRequestException(['uno', 'dos']));
    expect(status).toBe(400);
    expect(body.message).toBe('uno');
    expect(body.errors).toEqual(['uno', 'dos']);
  });

  it('errores desconocidos -> 500 con mensaje generico (sin filtrar detalles)', () => {
    const { status, body } = run(new Error('secreto interno'));
    expect(status).toBe(500);
    expect(body.message).not.toContain('secreto');
  });
});

describe('GlobalExceptionFilter - logging y errores Prisma', () => {
  it('PrismaClientValidationError -> 400 generico sin filtrar el mensaje', () => {
    const { status, body } = run(
      new Prisma.PrismaClientValidationError('Argument email: secret@x.com', {
        clientVersion: 'test',
      }),
    );
    expect(status).toBe(400);
    expect(body.message).not.toContain('secret');
  });

  it('P2034 -> 409', () => {
    expect(run(prismaError('P2034')).status).toBe(409);
  });

  it('en errores 500 solo se loguea name y code, nunca message', () => {
    const spy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    run(prismaError('P9999'));
    run(new Error('password=hunter2'));

    const logged = spy.mock.calls.map((c) => String(c[0])).join('|');
    expect(logged).toContain('PrismaClientKnownRequestError (P9999)');
    expect(logged).not.toContain('boom');
    expect(logged).not.toContain('hunter2');
    spy.mockRestore();
  });
});
