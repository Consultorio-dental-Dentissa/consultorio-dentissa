-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "cancelled_by_id" INTEGER;

-- CreateTable
CREATE TABLE "appointment_reschedules" (
    "id" SERIAL NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "previous_scheduled_at" TIMESTAMP(3) NOT NULL,
    "new_scheduled_at" TIMESTAMP(3) NOT NULL,
    "changed_by_id" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_reschedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_reschedules_appointment_id_idx" ON "appointment_reschedules"("appointment_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_reschedules" ADD CONSTRAINT "appointment_reschedules_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_reschedules" ADD CONSTRAINT "appointment_reschedules_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

