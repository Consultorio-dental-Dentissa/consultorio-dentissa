/*
  Warnings:

  - The `status` column on the `appointments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `rol` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `ubication` on the `services_images` table. All the data in the column will be lost.
  - You are about to drop the column `rol_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `consultas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fechas_bloqueadas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horarios_disponibles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imagenes_consultas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notificaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ofertas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ofertas_servicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `preguntas_frecuentes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[role]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDIENTE', 'COMPLETADA', 'CANCELADA', 'REPROGRAMADA', 'CONFIRMADA');

-- DropForeignKey
ALTER TABLE "consultas" DROP CONSTRAINT "consultas_cita_id_fkey";

-- DropForeignKey
ALTER TABLE "imagenes_consultas" DROP CONSTRAINT "imagenes_consultas_consulta_id_fkey";

-- DropForeignKey
ALTER TABLE "notificaciones" DROP CONSTRAINT "notificaciones_cita_id_fkey";

-- DropForeignKey
ALTER TABLE "notificaciones" DROP CONSTRAINT "notificaciones_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "ofertas_servicios" DROP CONSTRAINT "ofertas_servicios_oferta_id_fkey";

-- DropForeignKey
ALTER TABLE "ofertas_servicios" DROP CONSTRAINT "ofertas_servicios_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_rol_id_fkey";

-- DropIndex
DROP INDEX "roles_rol_key";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "status",
ADD COLUMN     "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDIENTE',
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "rol",
ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services_images" DROP COLUMN "ubication",
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "rol_id",
ADD COLUMN     "role_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "consultas";

-- DropTable
DROP TABLE "fechas_bloqueadas";

-- DropTable
DROP TABLE "horarios_disponibles";

-- DropTable
DROP TABLE "imagenes_consultas";

-- DropTable
DROP TABLE "notificaciones";

-- DropTable
DROP TABLE "ofertas";

-- DropTable
DROP TABLE "ofertas_servicios";

-- DropTable
DROP TABLE "preguntas_frecuentes";

-- CreateTable
CREATE TABLE "consultations" (
    "id" SERIAL NOT NULL,
    "notes" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointment_id" INTEGER NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations_images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "location" TEXT,
    "consultation_id" INTEGER NOT NULL,

    CONSTRAINT "consultations_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services_offers" (
    "offer_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "services_offers_pkey" PRIMARY KEY ("offer_id","service_id")
);

-- CreateTable
CREATE TABLE "available_time_slots" (
    "id" SERIAL NOT NULL,
    "week_day" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "available_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unavailable_time_slots" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "unavailable_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frequently_asked_questions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT NOT NULL,

    CONSTRAINT "frequently_asked_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "appointment_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consultations_appointment_id_key" ON "consultations"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations_images" ADD CONSTRAINT "consultations_images_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services_offers" ADD CONSTRAINT "services_offers_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services_offers" ADD CONSTRAINT "services_offers_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
