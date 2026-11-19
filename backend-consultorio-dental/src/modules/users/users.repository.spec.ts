import { UsersRepository } from './repositories/users.repository';

describe('UsersRepository - nunca expone la contrasena', () => {
  const user = { id: 1, name: 'A', lastname: 'B', email: 'a@b.c' };

  let prisma: any;
  let repository: UsersRepository;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([user]),
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn().mockResolvedValue(user),
        create: jest.fn().mockResolvedValue(user),
      },
      role: {
        findFirst: jest.fn().mockResolvedValue({ id: 3, role: 'PACIENTE' }),
      },
    };
    repository = new UsersRepository(prisma);
  });

  it('getAll omite password y password_changed_at', async () => {
    await repository.getAll();
    expect(prisma.user.findMany.mock.calls[0][0].omit).toEqual({
      password: true,
      password_changed_at: true,
    });
  });

  it('getById omite password y password_changed_at', async () => {
    await repository.getById(1);
    expect(prisma.user.findFirst.mock.calls[0][0].omit).toEqual({
      password: true,
      password_changed_at: true,
    });
  });

  it('create no selecciona password en la respuesta', async () => {
    await repository.create({
      name: 'A',
      lastname: 'B',
      email: 'a@b.c',
      password: 'hash',
      phone: '1',
      role: 'PACIENTE',
    } as any);

    const args = prisma.user.create.mock.calls[0][0];
    expect(args.select).toBeDefined();
    expect(args.select.password).toBeUndefined();
  });

  it('solo getUserByEmailWithPassword (uso interno de login) incluye password', async () => {
    prisma.user.findFirst.mockClear();
    await repository.getUserByEmailWithPassword('a@b.c');
    expect(prisma.user.findFirst.mock.calls[0][0].omit).toEqual({
      password: false,
    });
    expect(prisma.user.findFirst.mock.calls[0][0].where.email).toEqual({
      equals: 'a@b.c',
      mode: 'insensitive',
    });
  });
});
