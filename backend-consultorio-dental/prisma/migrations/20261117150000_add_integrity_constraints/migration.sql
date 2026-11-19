-- Migracion de integridad (aditiva, sin borrar tablas ni datos).
--
-- ADVERTENCIA: si ya existen datos que violen alguno de estos UNIQUE/CHECK/EXCLUDE,
-- la migracion FALLARA y se revertira completa (Postgres ejecuta cada migracion en
-- una transaccion), sin perdida de datos. Ejecutar antes las consultas de verificacion
-- previa indicadas en el informe, corregir los datos y volver a aplicar.

-- Nombres de servicio unicos
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- Indices de consulta
CREATE INDEX "appointments_scheduled_at_idx" ON "appointments"("scheduled_at");
CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");
CREATE INDEX "appointments_status_idx" ON "appointments"("status");
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CHECK (escritos a mano; Prisma no los modela)
ALTER TABLE "services"
  ADD CONSTRAINT "services_duration_minutes_positive" CHECK ("durationMinutes" > 0);
ALTER TABLE "services"
  ADD CONSTRAINT "services_price_non_negative" CHECK ("price" >= 0);
ALTER TABLE "offers"
  ADD CONSTRAINT "offers_date_range_valid" CHECK ("start_date" <= "end_date");
ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_duration_minutes_positive" CHECK ("durationMinutes" > 0);

-- No solape de citas que bloquean horario (PENDIENTE, CONFIRMADA y REPROGRAMADA; esta
-- ultima es un estado legacy que ya no se asigna pero cuyas filas antiguas siguen
-- ocupando agenda; no se modifica ningun dato), global por consultorio
-- (spec 03: una sola agenda; no hay recurso/profesional por el cual segmentar).
-- Se usa tsrange y no tstzrange porque scheduled_at es TIMESTAMP(3) sin zona (Prisma
-- guarda UTC): castear a timestamptz no es IMMUTABLE y Postgres rechazaria el indice.
-- El rango es semiabierto [inicio, fin): citas consecutivas no chocan, igual que la
-- validacion de la aplicacion. No se necesita btree_gist porque solo se usa el operador
-- && sobre un rango (no hay columna escalar con igualdad); asi se evita requerir
-- permisos para crear la extension.
ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_no_overlap"
  EXCLUDE USING gist (
    tsrange("scheduled_at", "scheduled_at" + "durationMinutes" * interval '1 minute') WITH &&
  ) WHERE ("status" IN ('PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'));
