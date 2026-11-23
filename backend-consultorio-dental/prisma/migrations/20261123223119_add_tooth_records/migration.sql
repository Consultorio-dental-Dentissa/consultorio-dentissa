-- CreateEnum
CREATE TYPE "ToothStatus" AS ENUM ('SANO', 'CARIES', 'REMOVIDO', 'CORONA');

-- CreateTable
CREATE TABLE "tooth_records" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "tooth_number" INTEGER NOT NULL,
    "status" "ToothStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" INTEGER,

    CONSTRAINT "tooth_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tooth_records_patient_id_idx" ON "tooth_records"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "tooth_records_patient_id_tooth_number_key" ON "tooth_records"("patient_id", "tooth_number");

-- AddForeignKey
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Numeracion FDI de dientes permanentes (escrito a mano; Prisma no modela CHECK).
ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_tooth_number_fdi_check"
  CHECK ("tooth_number" IN (11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48));

ALTER TABLE "tooth_records" ADD CONSTRAINT "tooth_records_notes_length_check"
  CHECK ("notes" IS NULL OR char_length("notes") <= 300);
