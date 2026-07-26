-- CreateEnum
CREATE TYPE "TOOTH_STATUS" AS ENUM ('SANO', 'CARIES', 'OBTURADO', 'AUSENTE', 'EXTRAIDO', 'CORONA', 'IMPLANTE');

-- CreateTable
CREATE TABLE "odontograms" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "odontograms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teeth" (
    "id" SERIAL NOT NULL,
    "odontogram_id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "TOOTH_STATUS" NOT NULL DEFAULT 'SANO',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teeth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "odontograms_patient_id_key" ON "odontograms"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "teeth_odontogram_id_number_key" ON "teeth"("odontogram_id", "number");

-- AddForeignKey
ALTER TABLE "odontograms" ADD CONSTRAINT "odontograms_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teeth" ADD CONSTRAINT "teeth_odontogram_id_fkey" FOREIGN KEY ("odontogram_id") REFERENCES "odontograms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
