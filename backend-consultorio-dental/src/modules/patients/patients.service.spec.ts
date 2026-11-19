import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Role } from '../users/enums/rol.enum';

describe('PatientsService - propiedad de la ficha', () => {
  let repository: {
    getById: jest.Mock;
    getIdByUserId: jest.Mock;
    getAll: jest.Mock;
  };
  let service: PatientsService;

  beforeEach(() => {
    repository = {
      getById: jest.fn().mockResolvedValue({ id: 10 }),
      getIdByUserId: jest.fn().mockResolvedValue(10),
      getAll: jest.fn(),
    };
    service = new PatientsService(
      repository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('ASISTENTE recibe la vista reducida (listado y detalle); ADMIN y PACIENTE la completa', async () => {
    repository.getAll.mockResolvedValue({ items: [], total: 0 });
    await service.getAllPatients({}, { id: 2, role: Role.ASISTENTE });
    await service.getAllPatients({}, { id: 1, role: Role.ADMINISTRADOR });
    expect(repository.getAll.mock.calls[0][1]).toBe('reduced');
    expect(repository.getAll.mock.calls[1][1]).toBe('full');

    await service.getPatientById(11, { id: 2, role: Role.ASISTENTE });
    await service.getPatientById(11, { id: 1, role: Role.ADMINISTRADOR });
    await service.getPatientById(10, { id: 5, role: Role.PACIENTE });
    expect(repository.getById.mock.calls[0][2]).toBe('reduced');
    expect(repository.getById.mock.calls[1][2]).toBe('full');
    expect(repository.getById.mock.calls[2][2]).toBe('full');
  });

  it('un PACIENTE que pide la ficha de otro paciente recibe 404 (no 403)', async () => {
    await expect(
      service.getPatientById(11, { id: 5, role: Role.PACIENTE }),
    ).rejects.toThrow(NotFoundException);
    expect(repository.getById).not.toHaveBeenCalled();
  });

  it('un PACIENTE puede ver su propia ficha', async () => {
    await expect(
      service.getPatientById(10, { id: 5, role: Role.PACIENTE }),
    ).resolves.toEqual({ id: 10 });
    expect(repository.getIdByUserId).toHaveBeenCalledWith(5);
  });

  it('un PACIENTE sin ficha asociada es rechazado', async () => {
    repository.getIdByUserId.mockResolvedValue(null);
    await expect(
      service.getPatientById(10, { id: 5, role: Role.PACIENTE }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('ADMIN y ASISTENTE pueden ver cualquier ficha', async () => {
    await expect(
      service.getPatientById(11, { id: 1, role: Role.ADMINISTRADOR }),
    ).resolves.toBeDefined();
    await expect(
      service.getPatientById(11, { id: 2, role: Role.ASISTENTE }),
    ).resolves.toBeDefined();
  });

  it('responde 404 si el paciente no existe', async () => {
    repository.getById.mockResolvedValue(null);
    await expect(
      service.getPatientById(99, { id: 1, role: Role.ADMINISTRADOR }),
    ).rejects.toThrow(NotFoundException);
  });
});
