import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PatientsRepository } from './repositories/patients.repository';
import { GetPatientsDto } from './dto/get-patients.dto';
import {
  AdminUpdatePatientDto,
  GetPatientHistoryDto,
  UpdateMyProfileDto,
} from './dto/update-patient.dto';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { TX_OPTIONS } from 'src/infrastructure/prisma/transaction-options';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { parseDateInput } from 'src/infrastructure/common/utils/date-input';
import { normalizePhone } from 'src/infrastructure/common/decorators/normalize-phone.decorator';
import { Role } from '../users/enums/rol.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';
import { ConsultationsRepository } from '../consultations/repositories/consultations.repository';
import { toConsultationResponse } from '../consultations/consultations.service';

type AuthUser = { id: number; role: string };

type ProfileChanges = {
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  emergency_phone?: string;
  address?: string;
  birth_date?: string;
  status?: boolean;
  current_password?: string;
};

@Injectable()
export class PatientsService {
  constructor(
    private patientsRepository: PatientsRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
    private consultationsRepository: ConsultationsRepository,
    private mailService: MailService,
  ) {}

  /**
   * ADMIN ve la ficha completa; el ASISTENTE solo datos de contacto basicos
   * (sin direccion, fecha de nacimiento ni telefono de emergencia).
   */
  private detailFor(user?: AuthUser): 'full' | 'reduced' {
    return (user?.role as Role) === Role.ASISTENTE ? 'reduced' : 'full';
  }

  async getAllPatients(filters?: GetPatientsDto, user?: AuthUser) {
    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.patientsRepository.getAll(
      filters,
      this.detailFor(user),
    );

    return { items, total, page, limit };
  }

  /**
   * Un PACIENTE solo puede acceder a su propia ficha. El patientId se obtiene
   * del usuario autenticado, nunca del cliente. 404 (no 403) para no revelar
   * la existencia de fichas ajenas.
   */
  private async assertOwnership(id: number, user?: AuthUser) {
    if (user && (user.role as Role) === Role.PACIENTE) {
      const ownPatientId = await this.patientsRepository.getIdByUserId(user.id);

      if (ownPatientId === null) {
        throw new ForbiddenException(
          'No tienes un perfil de paciente asociado',
        );
      }

      if (ownPatientId !== id) {
        throw new NotFoundException('El paciente que solicitaste no existe');
      }
    }
  }

  async getPatientById(id: number, user?: AuthUser) {
    await this.assertOwnership(id, user);

    const patient = await this.patientsRepository.getById(
      id,
      undefined,
      this.detailFor(user),
    );

    if (!patient) {
      throw new NotFoundException('El paciente que solicitaste no existe');
    }

    return patient;
  }

  private async requireOwnPatientId(user: AuthUser) {
    const patientId = await this.patientsRepository.getIdByUserId(user.id);
    if (patientId === null) {
      throw new ForbiddenException('No tienes un perfil de paciente asociado');
    }
    return patientId;
  }

  /** Perfil del paciente autenticado (el id sale del usuario, no del cliente). */
  async getMyProfile(user: AuthUser) {
    const patientId = await this.requireOwnPatientId(user);
    return await this.getPatientById(patientId, user);
  }

  /** PATCH /patients/me: solo email, telefono y telefono de emergencia. */
  async updateMyProfile(dto: UpdateMyProfileDto, user: AuthUser) {
    if ((user.role as Role) !== Role.PACIENTE) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción',
      );
    }
    const patientId = await this.requireOwnPatientId(user);

    // Se copian solo los campos autorizados (el DTO ya descarta el resto)
    return await this.applyChanges(
      patientId,
      {
        email: dto.email,
        phone: dto.phone,
        emergency_phone: dto.emergency_phone,
        current_password: dto.current_password,
      },
      user.id,
      AuditAction.PATIENT_PROFILE_UPDATED,
      true,
    );
  }

  /** PATCH /patients/:id (ADMIN). */
  async updatePatient(id: number, dto: AdminUpdatePatientDto, actorId: number) {
    return await this.applyChanges(
      id,
      { ...dto },
      actorId,
      AuditAction.PATIENT_UPDATED,
      false,
    );
  }

  private async applyChanges(
    patientId: number,
    changes: ProfileChanges,
    actorId: number,
    action: string,
    requirePasswordForEmail: boolean,
  ) {
    const { current_password: currentPassword, ...rawFields } = changes;
    // Defensa en profundidad: el DTO ya normaliza, el servicio no confia en ello
    const fields = {
      ...rawFields,
      phone: normalizePhone(rawFields.phone) as string | undefined,
      emergency_phone: normalizePhone(rawFields.emergency_phone) as
        string | undefined,
    };

    if (Object.values(fields).every((value) => value === undefined)) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    let birthDate: Date | undefined;
    if (fields.birth_date !== undefined) {
      // AAAA-MM-DD real o ISO con zona; fechas imposibles (2026-02-30) => 400
      const parsed = parseDateInput(fields.birth_date, 'start');
      if (!parsed) {
        throw new BadRequestException('La fecha de nacimiento no es válida');
      }
      if (parsed.getTime() > Date.now()) {
        throw new BadRequestException(
          'La fecha de nacimiento no puede ser futura',
        );
      }
      birthDate = parsed;
    }

    let previousEmail: string | null = null;
    let previousName = '';

    const result = await this.prisma.$transaction(async (tx) => {
      const current = await this.patientsRepository.getForUpdate(patientId, tx);
      if (!current) {
        throw new NotFoundException('El paciente que solicitaste no existe');
      }

      const userData: {
        name?: string;
        lastname?: string;
        email?: string;
        phone?: string;
        status?: boolean;
      } = {};
      const patientData: {
        address?: string;
        birth_date?: Date;
        emergency_phone?: string;
      } = {};
      const changedFields: string[] = [];

      if (fields.name !== undefined && fields.name !== current.user.name) {
        userData.name = fields.name;
        changedFields.push('name');
      }
      if (
        fields.lastname !== undefined &&
        fields.lastname !== current.user.lastname
      ) {
        userData.lastname = fields.lastname;
        changedFields.push('lastname');
      }
      if (
        fields.email !== undefined &&
        fields.email.toLowerCase() !== current.user.email.toLowerCase()
      ) {
        // Cambio de correo seguro: contrasena actual y sin duplicados
        if (requirePasswordForEmail) {
          await this.assertCurrentPassword(
            current.user.id,
            currentPassword,
            tx,
          );
        }
        if (
          await this.patientsRepository.isEmailTakenByOther(
            fields.email,
            current.user.id,
            tx,
          )
        ) {
          throw new BadRequestException('Este correo ya esta registrado');
        }
        userData.email = fields.email;
        changedFields.push('email');
        previousEmail = current.user.email;
        previousName = current.user.name;
      }
      if (fields.phone !== undefined && fields.phone !== current.user.phone) {
        if (
          await this.patientsRepository.isPhoneTakenByOther(
            fields.phone,
            current.user.id,
            tx,
          )
        ) {
          throw new BadRequestException('Este telefono ya esta registrado');
        }
        userData.phone = fields.phone;
        changedFields.push('phone');
      }
      const statusChanged =
        fields.status !== undefined && fields.status !== current.user.status;
      if (statusChanged) {
        userData.status = fields.status;
        changedFields.push('status');
      }
      if (
        fields.emergency_phone !== undefined &&
        fields.emergency_phone !== current.emergency_phone
      ) {
        patientData.emergency_phone = fields.emergency_phone;
        changedFields.push('emergency_phone');
      }
      if (fields.address !== undefined && fields.address !== current.address) {
        patientData.address = fields.address;
        changedFields.push('address');
      }
      if (
        birthDate !== undefined &&
        birthDate.getTime() !== current.birth_date.getTime()
      ) {
        patientData.birth_date = birthDate;
        changedFields.push('birth_date');
      }

      // Sin cambios reales: no se escribe ni se audita
      if (changedFields.length === 0) {
        return await this.patientsRepository.getById(patientId, tx);
      }

      const updated = await this.patientsRepository.applyUpdate(
        patientId,
        current.user.id,
        userData,
        patientData,
        tx,
      );

      // Cambio de correo: las sesiones y enlaces de recuperacion previos ya no
      // son validos (van en la misma transaccion para no dejar una ventana)
      if (userData.email !== undefined) {
        await this.patientsRepository.revokeRefreshTokens(current.user.id, tx);
        await this.patientsRepository.invalidateResetTokens(
          current.user.id,
          tx,
        );
      }

      if (statusChanged) {
        // Al desactivar se cierran las sesiones (igual que el cambio de correo)
        if (fields.status === false) {
          await this.patientsRepository.revokeRefreshTokens(
            current.user.id,
            tx,
          );
        }
        await this.auditService.log(
          {
            userId: actorId,
            action: AuditAction.USER_STATUS_CHANGED,
            entity: AuditEntity.USER,
            entityId: current.user.id,
            before: { status: current.user.status },
            after: { status: fields.status },
          },
          tx,
        );
      }

      // Solo los NOMBRES de los campos: nunca los valores (datos personales)
      await this.auditService.log(
        {
          userId: actorId,
          action,
          entity: AuditEntity.PATIENT,
          entityId: patientId,
          after: { changedFields },
        },
        tx,
      );

      return updated;
    }, TX_OPTIONS);

    // Tras el commit: aviso al correo anterior solo si SMTP esta configurado.
    // Sin await y sin registrar el correo; un fallo nunca afecta la respuesta.
    if (previousEmail && this.mailService.isConfigured()) {
      void this.mailService
        .sendEmailChangedNotice(previousEmail, previousName)
        .catch(() => undefined);
    }

    return result;
  }

  private async assertCurrentPassword(
    userId: number,
    currentPassword: string | undefined,
    tx: Parameters<PatientsRepository['getPasswordHash']>[1],
  ) {
    if (!currentPassword) {
      throw new BadRequestException(
        'Para cambiar el correo debes indicar tu contraseña actual',
      );
    }
    const hash = await this.patientsRepository.getPasswordHash(userId, tx);
    if (!hash) {
      throw new UnauthorizedException(
        'No tienes permitido realizar esta acción',
      );
    }
    if (!(await bcrypt.compare(currentPassword, hash))) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }
  }

  /**
   * Historial paginado del paciente.
   * - appointments: ADMIN, ASISTENTE y el propio PACIENTE.
   * - consultations (clinico): SOLO ADMIN.
   */
  async getHistory(id: number, filters: GetPatientHistoryDto, user: AuthUser) {
    await this.assertOwnership(id, user);

    const type = filters.type ?? 'appointments';
    const isAdmin = (user.role as Role) === Role.ADMINISTRADOR;

    if (type === 'consultations' && !isAdmin) {
      throw new ForbiddenException(
        'No tienes permiso para ver el historial clínico',
      );
    }

    if (!(await this.patientsRepository.existById(id))) {
      throw new NotFoundException('El paciente que solicitaste no existe');
    }

    const { page, limit, skip, take } = resolvePagination(filters);

    if (type === 'consultations') {
      const { items, total } = await this.consultationsRepository.getAll({
        patient_id: id,
        page,
        limit,
      });
      return {
        type,
        items: items.map(toConsultationResponse),
        total,
        page,
        limit,
      };
    }

    const { items, total } =
      await this.patientsRepository.getAppointmentHistory(
        id,
        { skip, take },
        isAdmin,
      );

    return {
      type,
      items: items.map(({ consultation, ...appointment }) =>
        isAdmin
          ? { ...appointment, consultation_id: consultation?.id ?? null }
          : appointment,
      ),
      total,
      page,
      limit,
    };
  }
}
