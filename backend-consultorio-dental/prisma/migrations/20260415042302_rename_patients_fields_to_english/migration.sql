/*
  Warnings:

  - You are about to drop the `pacientes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_paciente_id_fkey";

-- DropForeignKey
ALTER TABLE "pacientes" DROP CONSTRAINT "pacientes_usuario_id_fkey";

-- DropTable
DROP TABLE "pacientes";

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "emergency_phone" TEXT,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
