FROM node:22-alpine

WORKDIR /app

# Copiar package.json primero para aprovechar el cache de Docker
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# El código fuente se monta como volumen en docker-compose,
# por lo que los cambios locales se reflejan en tiempo real (hot-reload)
COPY . .

EXPOSE 5173

# --host es necesario para que Vite escuche fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]
