FROM node:22-bookworm-slim

# OpenSSL es requerido por el motor de migraciones de Prisma
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# INDICACIÓN: se instalan también las devDependencies porque el contenedor
# necesita el CLI de prisma (migraciones) y tsx (seed) al arrancar
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate && npm run build

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main"]
