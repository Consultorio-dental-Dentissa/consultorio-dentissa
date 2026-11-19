import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { UsersRepository } from './repositories/users.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TX_OPTIONS } from 'src/infrastructure/prisma/transaction-options';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/rol.enum';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private patientsRepository: PatientsRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllUsers(filters?: GetUsersDto) {
    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.usersRepository.getAll(filters);

    return { items, total, page, limit };
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.getById(id);

    if (!user) {
      throw new NotFoundException('El usuario no se ha encontrado');
    }

    return user;
  }

  /**
   * `actorId` es el administrador que crea la cuenta; en el registro publico
   * no hay actor y se audita con el propio usuario creado.
   */
  async createUser(user: CreateUserDto, actorId?: number) {
    const emailExists = await this.usersRepository.emailExists(user.email);

    if (emailExists) {
      throw new BadRequestException('Este correo ya esta registrado');
    }

    const phoneExists = await this.usersRepository.phoneExists(user.phone);

    if (phoneExists) {
      throw new BadRequestException('Este telefono ya esta registrado');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    user.password = hashedPassword;

    if (user.role === Role.PACIENTE && !user.patient) {
      throw new BadRequestException(
        'Debes llenar todos los campos del paciente',
      );
    }

    // Usuario, paciente (si aplica) y auditoria son atomicos
    return await this.prisma.$transaction(async (tx) => {
      const created = await this.usersRepository.create(user, tx);

      if (user.role === Role.PACIENTE && user.patient) {
        await this.patientsRepository.create(
          { ...user.patient, user_id: created.id },
          tx,
        );
      }

      // Sin contraseña ni datos personales: solo rol y estado
      await this.auditService.log(
        {
          userId: actorId ?? created.id,
          action: AuditAction.USER_CREATED,
          entity: AuditEntity.USER,
          entityId: created.id,
          after: { role: created.role.role, status: created.status },
        },
        tx,
      );

      return created;
    });
  }

  async getUserByEmailWithPassword(email: string) {
    return await this.usersRepository.getUserByEmailWithPassword(email);
  }

  /**
   * Un ADMIN no puede desactivarse a si mismo ni desactivar al ultimo
   * ADMIN activo. La verificacion y el cambio van en una transaccion
   * Serializable para evitar que dos desactivaciones concurrentes dejen
   * el sistema sin administradores.
   */
  async updateUserStatus(id: number, status: boolean, actingUserId?: number) {
    return await this.prisma.$transaction(
      async (tx) => {
        const target = await this.usersRepository.getByIdWithStatus(id, tx);

        if (!target) {
          throw new NotFoundException(
            'El usuario cuyo estatus quieres actualizar no existe',
          );
        }

        if (!status && target.status) {
          if (actingUserId !== undefined && actingUserId === id) {
            throw new ForbiddenException(
              'No puedes desactivar tu propia cuenta',
            );
          }

          if ((target.role.role as Role) === Role.ADMINISTRADOR) {
            const activeAdmins =
              await this.usersRepository.countActiveAdmins(tx);

            if (activeAdmins <= 1) {
              throw new BadRequestException(
                'No se puede desactivar al ultimo administrador activo',
              );
            }
          }
        }

        const updated = await this.usersRepository.updateUserStatus(
          id,
          status,
          tx,
        );

        await this.auditService.log(
          {
            userId: actingUserId,
            action: AuditAction.USER_STATUS_CHANGED,
            entity: AuditEntity.USER,
            entityId: id,
            before: { status: target.status },
            after: { status },
          },
          tx,
        );

        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Edicion de datos de un usuario por el ADMIN (PATCH /users/:id). Parcial,
   * sin contraseña ni estado. Todo en una transaccion Serializable con bloqueo
   * de la fila (dos admins que se degradan mutuamente no pueden dejar el
   * sistema sin administradores). Sin cambios reales: sin escritura ni auditoria.
   */
  async updateUser(id: number, dto: UpdateUserDto, actingUserId: number) {
    if (
      dto.name === undefined &&
      dto.lastname === undefined &&
      dto.email === undefined &&
      dto.phone === undefined &&
      dto.role === undefined
    ) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    return await this.prisma.$transaction(
      async (tx) => {
        await this.usersRepository.lockById(id, tx);
        const current = await this.usersRepository.getForUpdate(id, tx);

        if (!current) {
          throw new NotFoundException('El usuario no se ha encontrado');
        }

        const currentRole = current.role.role as Role;
        const data: Prisma.UserUncheckedUpdateInput = {};
        const changedFields: string[] = [];

        if (dto.name !== undefined && dto.name !== current.name) {
          data.name = dto.name;
          changedFields.push('name');
        }
        if (dto.lastname !== undefined && dto.lastname !== current.lastname) {
          data.lastname = dto.lastname;
          changedFields.push('lastname');
        }
        if (
          dto.email !== undefined &&
          dto.email.toLowerCase() !== current.email.toLowerCase()
        ) {
          // Edicion de la propia cuenta: exige la contraseña actual
          if (actingUserId === id) {
            if (!dto.current_password) {
              throw new BadRequestException('Ingresa tu contraseña actual');
            }
            const hash = await this.usersRepository.getPasswordHash(id, tx);
            if (!hash || !(await bcrypt.compare(dto.current_password, hash))) {
              throw new BadRequestException(
                'La contraseña actual es incorrecta',
              );
            }
          }
          if (
            await this.usersRepository.isEmailTakenByOther(dto.email, id, tx)
          ) {
            throw new BadRequestException('Este correo ya esta registrado');
          }
          data.email = dto.email;
          changedFields.push('email');
        }
        if (dto.phone !== undefined && dto.phone !== current.phone) {
          if (
            await this.usersRepository.isPhoneTakenByOther(dto.phone, id, tx)
          ) {
            throw new BadRequestException('Este telefono ya esta registrado');
          }
          data.phone = dto.phone;
          changedFields.push('phone');
        }

        const roleChanged = dto.role !== undefined && dto.role !== currentRole;
        if (roleChanged) {
          const newRole = dto.role as Role;

          // Los pacientes tienen ficha 1:1: solo se alterna ADMIN <-> ASISTENTE
          if (currentRole === Role.PACIENTE || newRole === Role.PACIENTE) {
            throw new BadRequestException(
              'No se puede cambiar el rol de o hacia PACIENTE: los pacientes tienen una ficha asociada',
            );
          }

          if (currentRole === Role.ADMINISTRADOR) {
            if (actingUserId === id) {
              throw new ForbiddenException(
                'No puedes quitarte a ti mismo el rol de administrador',
              );
            }
            if (current.status) {
              const activeAdmins =
                await this.usersRepository.countActiveAdmins(tx);
              if (activeAdmins <= 1) {
                throw new BadRequestException(
                  'No se puede cambiar el rol del ultimo administrador activo',
                );
              }
            }
          }

          const roleId = await this.usersRepository.findRoleId(newRole, tx);
          if (roleId === null) throw new NotFoundException('Rol no encontrado');
          data.role_id = roleId;
          // Invalida los access tokens ya emitidos (llevan el rol anterior)
          data.password_changed_at = new Date();
          changedFields.push('role');
        }

        if (changedFields.length === 0) {
          return await this.usersRepository.getById(id, tx);
        }

        await this.usersRepository.applyUpdate(id, data, tx);

        // Cambio de correo o de rol: las sesiones previas ya no son validas
        if (data.email !== undefined || roleChanged) {
          await this.usersRepository.revokeRefreshTokens(id, tx);
        }
        if (data.email !== undefined) {
          await this.usersRepository.invalidateResetTokens(id, tx);
        }

        // Solo los NOMBRES de los campos: nunca los valores (datos personales)
        await this.auditService.log(
          {
            userId: actingUserId,
            action: AuditAction.USER_UPDATED,
            entity: AuditEntity.USER,
            entityId: id,
            after: { changedFields },
          },
          tx,
        );

        return await this.usersRepository.getById(id, tx);
      },
      {
        ...TX_OPTIONS,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
