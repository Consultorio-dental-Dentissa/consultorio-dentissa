import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ToothStatus } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { TX_OPTIONS } from 'src/infrastructure/prisma/transaction-options';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';
import { UpdateToothDto } from './dto/update-tooth.dto';
import { FDI_TEETH, isValidTooth } from './odontogram.constants';
import {
  OdontogramRepository,
  ToothRow,
} from './repositories/odontogram.repository';

function toToothResponse(toothNumber: number, row?: ToothRow | null) {
  return {
    tooth_number: toothNumber,
    status: row?.status ?? ToothStatus.SANO,
    notes: row?.notes ?? null,
    updated_at: row?.updated_at ?? null,
  };
}

@Injectable()
export class OdontogramService {
  constructor(
    private repository: OdontogramRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getByPatient(patientId: number) {
    if (!(await this.repository.patientExists(patientId))) {
      throw new NotFoundException('Paciente no encontrado');
    }
    const rows = await this.repository.findByPatient(patientId);
    const byTooth = new Map(rows.map((row) => [row.tooth_number, row]));

    return {
      patient_id: patientId,
      teeth: FDI_TEETH.map((tooth) =>
        toToothResponse(tooth, byTooth.get(tooth)),
      ),
    };
  }

  async updateTooth(
    patientId: number,
    toothNumber: number,
    dto: UpdateToothDto,
    userId: number,
  ) {
    if (!isValidTooth(toothNumber)) {
      throw new BadRequestException(
        'El diente no es válido (numeración FDI de dientes permanentes)',
      );
    }
    const notes = dto.notes ?? null;

    return await this.prisma.$transaction(async (tx) => {
      if (!(await this.repository.patientExists(patientId, tx))) {
        throw new NotFoundException('Paciente no encontrado');
      }
      const current = await this.repository.findOne(patientId, toothNumber, tx);
      const beforeStatus = current?.status ?? ToothStatus.SANO;
      const beforeNotes = current?.notes ?? null;

      // Sin cambio real (la ausencia de fila equivale a SANO sin nota).
      if (dto.status === beforeStatus && notes === beforeNotes) {
        return toToothResponse(toothNumber, current);
      }

      const saved = await this.repository.upsert(
        patientId,
        toothNumber,
        { status: dto.status, notes },
        userId,
        tx,
      );

      // Nunca se guarda el contenido de la nota: solo si cambio.
      await this.auditService.log(
        {
          userId,
          action: AuditAction.ODONTOGRAM_TOOTH_UPDATED,
          entity: AuditEntity.PATIENT,
          entityId: patientId,
          before: { tooth_number: toothNumber, status: beforeStatus },
          after: {
            tooth_number: toothNumber,
            status: saved.status,
            note_changed: notes !== beforeNotes,
          },
        },
        tx,
      );

      return toToothResponse(toothNumber, saved);
    }, TX_OPTIONS);
  }
}
