-- CreateIndex
CREATE INDEX "consultations_images_consultation_id_idx" ON "consultations_images"("consultation_id");

-- CreateIndex
CREATE INDEX "services_images_service_id_idx" ON "services_images"("service_id");

-- Telefono unico (indice parcial escrito a mano; Prisma no modela indices parciales).
-- Las filas con phone NULL no participan. Verificado antes de aplicar: sin duplicados.
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone") WHERE "phone" IS NOT NULL;
