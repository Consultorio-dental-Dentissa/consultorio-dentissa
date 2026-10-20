#!/bin/sh
set -e

echo "Aplicando migraciones de la base de datos..."
npx prisma migrate deploy

# INDICACIÓN: el seed es idempotente (skipDuplicates / upsert),
# por lo que es seguro ejecutarlo en cada arranque
echo "Ejecutando seed de la base de datos..."
npx prisma db seed

echo "Iniciando servidor..."
exec "$@"
