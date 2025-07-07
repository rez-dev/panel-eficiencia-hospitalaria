-- Script de inicialización de la base de datos
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear la tabla hospitals si no existe
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,  -- ID único autoincremental
    hospital_id INTEGER,
    region_id INTEGER,
    hospital_name VARCHAR(128),
    hospital_alternative_name VARCHAR(64),
    latitud REAL,
    longitud REAL,
    consultas REAL,
    grdxegresos REAL,
    bienesyservicios REAL,
    remuneraciones REAL,
    diascamadisponibles REAL,
    consultasurgencias REAL,
    examenes REAL,
    quirofanos REAL,
    año INTEGER,
    complejidad INTEGER
);

-- Limpiar datos existentes
TRUNCATE TABLE hospitals;

-- Cargar datos directamente desde el archivo CSV
COPY hospitals (
    hospital_id,
    region_id,
    hospital_name,
    hospital_alternative_name,
    latitud,
    longitud,
    consultas,
    grdxegresos,
    bienesyservicios,
    remuneraciones,
    diascamadisponibles,
    consultasurgencias,
    examenes,
    quirofanos,
    año,
    complejidad
)
FROM '/docker-entrypoint-initdb.d/hospitals.csv'
DELIMITER ','
CSV HEADER;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_hospitals_hospital_id ON hospitals(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_region_id ON hospitals(region_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_año ON hospitals(año);
CREATE INDEX IF NOT EXISTS idx_hospitals_complejidad ON hospitals(complejidad);

-- Mostrar estadísticas de carga
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT hospital_id) as unique_hospitals,
    COUNT(DISTINCT region_id) as total_regions,
    MIN(año) as año_minimo,
    MAX(año) as año_maximo,
    COUNT(DISTINCT año) as total_años
FROM hospitals;
