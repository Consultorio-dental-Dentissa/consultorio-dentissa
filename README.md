# Dentissa

Sistema de gestión para un consultorio dental: citas, pacientes, servicios, usuarios y más.

El proyecto tiene dos partes, cada una con sus propias dependencias:

| Carpeta | Qué es | Tecnología |
| --- | --- | --- |
| `frontend-consultorio-dental/` | La aplicación web | React + Vite |
| `backend-consultorio-dental/` | La API | NestJS + Prisma + PostgreSQL |
| `docs/` | Requerimientos, diagramas y prototipos | — |

---

## Cómo ejecutar el proyecto

Elige **una** de las dos opciones.

### Opción 1: con Docker (recomendada)

Solo necesitas tener [Docker](https://docs.docker.com/get-docker/) instalado.

```bash
docker compose up -d --build
```

Listo. Abre **http://localhost:5173** en el navegador.

Docker levanta la base de datos, el backend y el frontend, y prepara la base de datos automáticamente.

Comandos útiles:

```bash
docker compose down        # detener el proyecto (los datos se conservan)
docker compose down -v     # detener y borrar la base de datos
docker compose logs -f     # ver lo que está pasando
```

### Opción 2: sin Docker

Necesitas **Node.js 22 o superior** y **PostgreSQL** instalado y corriendo.

**1. Backend** (en una terminal):

```bash
cd backend-consultorio-dental
cp .env.example .env       # luego edita .env con los datos de tu PostgreSQL
npm run setup              # instala dependencias y prepara la base de datos
npm run start:dev
```

En el archivo `.env` solo es obligatorio completar `DATABASE_URL` y `JWT_SECRET`.

**2. Frontend** (en otra terminal):

```bash
cd frontend-consultorio-dental
npm install
npm run dev
```

Abre **http://localhost:5173** en el navegador.

---

## Iniciar sesión

Con cualquiera de las dos opciones se crea un usuario administrador:

- **Correo:** `administrador@gmail.com`
- **Contraseña:** `12345678`

---

## Direcciones

| Qué | Dirección |
| --- | --- |
| Aplicación web | http://localhost:5173 |
| API | http://localhost:3000 |
| Base de datos (solo con Docker) | `localhost:5433` |

> No cambies los puertos 5173 y 3000: el backend solo acepta peticiones desde `http://localhost:5173`.

---

## Documentación

- [Requerimientos del sistema](docs/requerimientos/requerimientos.md)
- [Diagrama de la base de datos](docs/requerimientos/diagramas.md)
- [Convenciones del backend](docs/convenciones/backend.md)
- [Convenciones del frontend](docs/convenciones/frontend.md)
