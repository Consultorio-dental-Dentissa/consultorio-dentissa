/*
  Warnings:

  - You are about to drop the `imagenes_servicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `servicios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "imagenes_servicio" DROP CONSTRAINT "imagenes_servicio_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "ofertas_servicios" DROP CONSTRAINT "ofertas_servicios_servicio_id_fkey";

-- DropTable
DROP TABLE "imagenes_servicio";

-- DropTable
DROP TABLE "servicios";

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services_images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "ubication" TEXT,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "services_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "services_images" ADD CONSTRAINT "services_images_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertas_servicios" ADD CONSTRAINT "ofertas_servicios_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
