# panel-eficiencia-hospitalaria
Este proyecto consiste en un panel web que calcula y visualiza la eficiencia técnica hospitalaria, integrando metodologías como DEA, SFA y el Índice Malmquist. Permite comparar indicadores clave y apoyar la toma de decisiones en la gestión de recursos de hospitales.

## Visión general

Aplicación full-stack compuesta por:
- Backend en FastAPI que expone endpoints para análisis de eficiencia (DEA, SFA, Malmquist, PCA/Clustering) y determinantes.
- Frontend en React (Vite) que consume la API y muestra visualizaciones y comparativas.
- Base de datos PostgreSQL inicializada con datos de hospitales.
- Tests end-to-end con Playwright y tests de backend con Pytest.

## Arquitectura

- **Frontend**: `frontend/` (Vite + React)
- **Backend**: `backend/` (FastAPI + SQLAlchemy)
- **DB**: `db/` (scripts de inicialización y CSV)
- **E2E**: `e2e-tests/` (Playwright)
- **Orquestación**: `docker-compose.yml`

Endpoints de documentación de la API (una vez corriendo el backend):
- Swagger UI: `http://localhost:8000/docs`

## Cómo ejecutar con Docker

1) Crear un archivo `.env` en la raíz con, por ejemplo:

```env
# Puertos expuestos
FRONTEND_PORT=5173
BACKEND_PORT=8000
POSTGRES_PORT=5432

# Conexión a PostgreSQL (usada por el backend)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hospitals
POSTGRES_HOST=db

# Backend
SERVER_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ENVIRONMENT=development

# Frontend → URL del backend
VITE_APP_BACKEND_ADDRESS=http://localhost:8000
```

2) Levantar el stack:

```bash
docker compose up -d --build
```

3) Acceder:
- Frontend: `http://localhost:5173` (o el puerto configurado en `FRONTEND_PORT`)
- API: `http://localhost:8000`

Para detener: `docker compose down`

## Cómo ejecutar en local (sin Docker)

### Backend (FastAPI)
Requisitos: Python 3.10+ y PostgreSQL en marcha (puedes levantar solo la DB con Docker: `docker compose up -d db`).

```bash
cd backend
python -m venv .venv && .\.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Variables de entorno mínimas (ejemplo para DB local en localhost)
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=postgres
set POSTGRES_DB=hospitals
set POSTGRES_HOST=localhost
set POSTGRES_PORT=5432
set BACKEND_PORT=8000
set SERVER_HOST=0.0.0.0
set CORS_ORIGINS=http://localhost:5173
set ENVIRONMENT=development

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Vite + React)
Requisitos: Node.js 18+.

```bash
cd frontend
npm install

# Configurar URL del backend (archivo frontend/.env o variable de entorno)
echo VITE_APP_BACKEND_ADDRESS=http://localhost:8000 > .env

npm run dev
```

## Variables de entorno

- `FRONTEND_PORT`: Puerto expuesto del frontend (por defecto 5173).
- `BACKEND_PORT`: Puerto expuesto del backend (por defecto 8000).
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PORT`: Conexión a PostgreSQL usada por el backend.
- `SERVER_HOST`: Host de escucha del backend (en Docker suele ser `0.0.0.0`).
- `CORS_ORIGINS`: Orígenes permitidos para CORS.
- `ENVIRONMENT`: `development`/`production` (activa `--reload` en local).
- `VITE_APP_BACKEND_ADDRESS`: URL del backend consumida por el frontend.

## Estructura de carpetas

```text
.
├─ backend/               # API FastAPI, modelos, rutas y tests
├─ frontend/              # Aplicación React (Vite)
├─ db/                    # Init SQL y datasets
├─ e2e-tests/             # Tests end-to-end (Playwright)
├─ calc-functions/        # Notebooks y procesamiento de datos
├─ docker-compose.yml     # Orquestación de servicios
└─ README.md
```

## Cómo correr tests

### Backend (Pytest)
```bash
cd backend
pytest
```

### End-to-End (Playwright)
Requiere el frontend y backend corriendo (por Docker o local).

```bash
cd e2e-tests
npm install
npx playwright install
npm run test
# Ver reporte HTML
npm run report
```

## Enlaces a documentación

- API (Swagger): `http://localhost:8000/docs`
- Documentación técnica adicional (opcional): crear carpeta `docs/` o sitio con MkDocs.