FROM node:22-alpine

WORKDIR /app

# Copiar package.json primero para aprovechar el cache de capas de Docker
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluye devDependencies para ts-node, nest, etc.)
RUN npm install

# Generar el cliente de Prisma con los tipos correctos
RUN npx prisma generate

# El código fuente se monta como volumen en docker-compose,
# así los cambios locales se reflejan en tiempo real (hot-reload)
COPY . .

EXPOSE 3000

# Al arrancar: aplica migraciones pendientes y luego inicia en modo desarrollo (watch)
CMD npx prisma migrate deploy && npm run start:dev