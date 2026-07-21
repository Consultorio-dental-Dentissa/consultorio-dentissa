# Dentissa

Sistema de gestión para consultorio dental: administración de citas, pacientes, historial clínico (odontograma), servicios, ofertas y notificaciones.

> El detalle funcional completo está en [`/docs/requerimientos.md`](/docs/requerimientos/requerimientos.md). Este README solo cubre cómo levantar el proyecto localmente.

## Stack técnico

- **Frontend:** React
- **Backend:** NestJS
- **Base de datos:** PostgreSQL
- **ORM:** Prisma
- **Gestor de paquetes:** npm

## Requisitos previos

- Node.js (v22 o superior recomendado)
- npm
- PostgreSQL corriendo localmente (o accesible vía conexión remota)

## Estructura del repositorio

```
/
├── backend-consultorio-dental/          # API NestJS + Prisma
├── frontend-consultorio-dental/         # Aplicación React
├── docs/ # Documentación del proyecto (requerimientos, arquitectura, diagramas, etc.)
└── README.md
```

Frontend y backend son proyectos independientes dentro del mismo repositorio, cada uno con su propio `package.json` y sus propias dependencias.

## Instalación y arranque local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Consultorio-dental-Dentissa/consultorio-dentissa.git
cd consultorio-dentissa
```

### 2. Backend
Copia el archivo de variables de entorno de ejemplo y complétalo con tus datos locales:

```bash
cd backend-consultorio-dental
cp .env.example .env
```

Corre las dependencias y prepara la base de datos con el ORM prisma. Para eso hay que correr el comando `npm run setup`. Este comando se encargará de:

- Instalar las dependencias (`npm install`).
- Crear el cliente de prisma (`npx prisma generate`)
- Aplicar las migraciones (`npx prisma migrate dev`)
- Correr las semillas para crear el primer usuario administrador (`npx prisma db seed`)

*Nota: revisa la salida de la consola tras correr el seed para las credenciales del usuario administrador inicial*

```bash
npm run setup
```

Levanta el servidor en modo desarrollo:

```bash
npm run start:dev
```

### 3. Frontend

En otra terminal:

```bash
cd frontend-consultorio-dental
npm install
npm run dev
```

## Variables de entorno

Ver [`backend-consultorio-dental/.env.example`](backend-consultorio-dental/.env.example) para la lista completa. Las más importantes:

| Variable            | Descripción                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | Cadena de conexión a PostgreSQL. Formato: `postgresql://usuario:password@localhost:5432/nombre_db` |
| `DATABASE_HOST`     | Host del servidor de base de datos                                                                 |
| `DATABASE_PORT`     | Puerto de PostgreSQL                                                                               |
| `DATABASE_NAME`     | Nombre de la base de datos                                                                         |
| `DATABASE_USER`     | Usuario de conexión a la base de datos                                                             |
| `DATABASE_PASSWORD` | Contraseña del usuario de base de datos                                                            |
| `ON_PRODUCTION`     | Bandera booleana que indica si el entorno actual es de producción                                  |
| `JWT_SECRET`        | Clave para firmar los tokens de autenticación                                                      |

## Documentación adicional

- [Requerimientos funcionales y no funcionales](/docs/requerimientos/requerimientos.md)
- [Diagrama entidad-relación](/docs/requerimientos/diagramas.md)
- Arquitectura del proyecto — próximamente en `/docs/arquitectura.md`
- Guía de contribución — próximamente en `CONTRIBUTING.md`