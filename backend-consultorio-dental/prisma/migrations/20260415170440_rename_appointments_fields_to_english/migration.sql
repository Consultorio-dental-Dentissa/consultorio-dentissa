/*
  Warnings:

  - You are about to drop the `citas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_paciente_id_fkey";

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "consultas" DROP CONSTRAINT "consultas_cita_id_fkey";

-- DropForeignKey
ALTER TABLE "notificaciones" DROP CONSTRAINT "notificaciones_cita_id_fkey";

-- DropTable
DROP TABLE "citas";

-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "notes" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patient_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
