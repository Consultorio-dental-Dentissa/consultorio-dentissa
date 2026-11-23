import { Injectable } from '@nestjs/common';
import { Prisma, ToothStatus } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

export const TOOTH_SELECT = {
  tooth_number: true,
  status: true,
  notes: true,
  updated_at: true,
} satisfies Prisma.ToothRecordSelect;

export type ToothRow = Prisma.ToothRecordGetPayload<{
  select: typeof TOOTH_SELECT;
}>;

@Injectable()
export class OdontogramRepository {
  constructor(private prisma: PrismaService) {}

  async patientExists(patientId: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const patient = await client.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    return patient !== null;
  }

  findByPatient(patientId: number) {
    return this.prisma.toothRecord.findMany({
      where: { patient_id: patientId },
      select: TOOTH_SELECT,
    });
  }

  findOne(
    patientId: number,
    toothNumber: number,
    tx: Prisma.TransactionClient,
  ) {
    return tx.toothRecord.findUnique({
      where: {
        patient_id_tooth_number: {
          patient_id: patientId,
          tooth_number: toothNumber,
        },
      },
      select: TOOTH_SELECT,
    });
  }

  upsert(
    patientId: number,
    toothNumber: number,
    data: { status: ToothStatus; notes: string | null },
    userId: number,
    tx: Prisma.TransactionClient,
  ) {
    return tx.toothRecord.upsert({
      where: {
        patient_id_tooth_number: {
          patient_id: patientId,
          tooth_number: toothNumber,
        },
      },
      create: {
        patient_id: patientId,
        tooth_number: toothNumber,
        status: data.status,
        notes: data.notes,
        updated_by_id: userId,
      },
      update: {
        status: data.status,
        notes: data.notes,
        updated_by_id: userId,
      },
      select: TOOTH_SELECT,
    });
  }
}
