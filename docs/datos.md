# Datos y Diccionario

Resumen de variables usadas en análisis (nombres según columnas de la tabla `hospitals`).

## Identificación y contexto
- `hospital_id` (int): identificador único
- `hospital_name` (str): nombre oficial
- `hospital_alternative_name` (str): alias
- `region_id` (int): código de región
- `latitud`/`longitud` (float): geolocalización
- `año` (int): año de referencia
- `complejidad` (int): 1=baja, 2=media, 3=alta

## Inputs (recursos)
- `bienesyservicios` (int)
- `remuneraciones` (int)
- `diascamadisponibles` (int)

## Outputs (productos)
- `consultas` (int)
- `grdxegresos` (float)
- `consultasurgencias` (int)
- `examenes` (float)

## Otras métricas
- `quirofanos` (float)
- `indiceocupacional`, `indicerotacion`, `promediodiasestadia`, `letalidad`, `egresosfallecidos` (si disponibles)

## Calidad de datos
- Valores faltantes: los endpoints reemplazan `NaN/Inf` por `0` para serialización JSON
- Asegura que las columnas referidas existan antes de invocarlas en parámetros
