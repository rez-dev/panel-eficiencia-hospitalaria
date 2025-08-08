# Backend (FastAPI)

Servicio API para el Panel de Eficiencia Hospitalaria. Expone endpoints para análisis de eficiencia (DEA, SFA, Malmquist, PCA/Clustering) y determinantes.

## Requisitos
- Python 3.10+
- PostgreSQL 15+ (puedes usar el servicio `db` del `docker-compose`)

## Variables de entorno
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `BACKEND_PORT` (por defecto 8000)
- `SERVER_HOST` (por defecto `0.0.0.0`)
- `CORS_ORIGINS` (por defecto incluye `http://localhost:5173`)
- `ENVIRONMENT` (`development`/`production`)

## Ejecutar en local
```bash
cd backend
python -m venv .venv && .\\.venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Documentación de API (Swagger)
- Swagger UI: `http://localhost:8000/docs`

## Endpoints principales
- `GET /health`: estado del servicio
- `GET /db-status`: estado de conexión a la base de datos
- `GET /hospitals`: listado de hospitales con filtros (`year`, `region_id`, `complejidad`)
- `GET /hospitals/{hospital_id}`: detalle por ID
- `GET /sfa`: eficiencia por SFA (`year`, `input_cols`, `output_cols`)
- `GET /dea`: eficiencia por DEA (`year`, `input_cols`, `output_cols`)
- `GET /pca`: análisis PCA (`year`, `feature_cols`, `n_components`, `scale`)
- `GET /pca-clustering`: PCA + KMeans (`method`, `n_components`, `k`, `k_max`, `scale`, `random_state`)
- `GET /malmquist`: índice Malmquist (`year_t`, `year_t1`, `input_cols`, `output_cols`, `top_input_col`)
- `GET /determinantes-efficiency`: determinantes de eficiencia (método + variables)

## Ejemplos rápidos
```bash
# Hospitales 2014
curl "http://localhost:8000/hospitals?year=2014"

# DEA 2014 con columnas por defecto
curl "http://localhost:8000/dea?year=2014"

# Malmquist 2014→2016
curl "http://localhost:8000/malmquist?year_t=2014&year_t1=2016&input_cols=bienesyservicios,remuneraciones&output_cols=consultas&top_input_col=remuneraciones"
```

## Estructura relevante
- `main.py`: aplicación FastAPI, CORS y arranque
- `routes.py`: endpoints
- `database/`: conexión, modelos y esquemas
- `utils/functions.py`: lógica de análisis (DEA/SFA/PCA/Malmquist/determinantes)

## Extender el backend
1. Añade la lógica en `utils/functions.py`.
2. Expón un endpoint en `routes.py` (valida parámetros y maneja errores HTTP).
3. Si requiere modelos/esquemas nuevos, agrégalos en `database/models.py` y `database/schemas.py`.
4. Documenta el endpoint con `summary/description` y verifica en Swagger.

## Tests (Pytest)
```bash
cd backend
pytest
```
