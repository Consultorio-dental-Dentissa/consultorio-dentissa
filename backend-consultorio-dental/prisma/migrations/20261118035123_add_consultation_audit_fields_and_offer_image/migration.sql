-- AlterTable
ALTER TABLE "consultations" ADD COLUMN     "created_by_id" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_by_id" INTEGER;

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE INDEX "consultations_created_at_idx" ON "consultations"("created_at");

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
