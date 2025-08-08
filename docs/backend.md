# Backend: Referencia de API

Documentación operativa y ejemplos. Para especificación completa, usa Swagger en `http://localhost:8000/docs`.

## Endpoints
- `GET /health`
- `GET /db-status`
- `GET /hospitals?year&region_id&complejidad`
- `GET /hospitals/{hospital_id}`
- `GET /sfa?year&input_cols&output_cols`
- `GET /dea?year&input_cols&output_cols`
- `GET /pca?year&feature_cols&n_components&scale`
- `GET /pca-clustering?year&input_cols&output_cols&method&n_components&k&k_max&scale&random_state`
- `GET /malmquist?year_t&year_t1&input_cols&output_cols&top_input_col`
- `GET /determinantes-efficiency?efficiency_method&independent_vars&input_cols&output_cols&year&top_n`

## Ejemplos
```bash
# 1) Listar hospitales 2014
curl "http://localhost:8000/hospitals?year=2014"

# 2) DEA (inputs/outputs por defecto)
curl "http://localhost:8000/dea?year=2014"

# 3) SFA (un output, varios inputs)
curl "http://localhost:8000/sfa?year=2014&input_cols=bienesyservicios,remuneraciones,diascamadisponibles&output_cols=consultas"

# 4) PCA
curl "http://localhost:8000/pca?year=2014&feature_cols=bienesyservicios,remuneraciones,diascamadisponibles,consultas&n_components=2&scale=true"

# 5) PCA + Clustering (k auto)
curl "http://localhost:8000/pca-clustering?year=2014&input_cols=bienesyservicios,remuneraciones,diascamadisponibles&output_cols=grdxegresos&method=DEA&n_components=2&scale=true"

# 6) Malmquist 2014→2016
curl "http://localhost:8000/malmquist?year_t=2014&year_t1=2016&input_cols=bienesyservicios,remuneraciones&output_cols=consultas&top_input_col=remuneraciones"

# 7) Determinantes (DEA)
curl "http://localhost:8000/determinantes-efficiency?efficiency_method=DEA&year=2014&input_cols=bienesyservicios,remuneraciones,diascamadisponibles&output_cols=consultas&independent_vars=complejidad,region_id"
```

## Códigos de error comunes
- 400: parámetros/columnas inválidas
- 404: no hay datos para los filtros solicitados
- 500: error interno de procesamiento

## Extensión de la API
1. Implementa la lógica en `utils/functions.py`
2. Crea endpoint en `routes.py`
3. Valida parámetros con `fastapi.Query` y retorna errores con `HTTPException`
4. Documenta `summary/description` y revisa en Swagger
