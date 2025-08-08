# Arquitectura

## Componentes
- Frontend (Vite + React): UI del panel
- Backend (FastAPI): API de análisis y agregación
- DB (PostgreSQL): persistencia de datos hospitalarios
- Orquestación (docker-compose): arranque coordinado de servicios

## Flujo alto nivel
1. Usuario navega el frontend y selecciona filtros/variables
2. Frontend llama al backend (`/dea`, `/sfa`, `/malmquist`, `/pca`, etc.)
3. Backend consulta/filtra datos en PostgreSQL y ejecuta cálculos en `utils/functions.py`
4. Backend retorna JSON; frontend renderiza gráficos y tablas

## Puertos por defecto
- Frontend: 5173
- Backend: 8000
- PostgreSQL: 5432

## Consideraciones
- CORS: configurar `CORS_ORIGINS` para el origen del frontend
- Variables de entorno: DB y puertos gestionados por `docker-compose.yml`
