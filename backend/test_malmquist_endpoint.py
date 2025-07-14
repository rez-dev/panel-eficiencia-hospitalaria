"""
Tests para el endpoint /malmquist - Análisis de índice de Malmquist.

El endpoint Malmquist analiza cambios de productividad hospitalaria entre dos períodos,
descomponiendo el cambio en:
- Cambio en eficiencia técnica (EFFCH)
- Cambio tecnológico (TECH)  
- Índice Malmquist total (productividad)

Tests que cubren:
- Funcionamiento básico con dos años válidos
- Validaciones de parámetros (años iguales, columnas inválidas)
- Manejo de casos sin datos para los años especificados
- Parámetros personalizados de inputs y outputs
"""

import pytest
from fastapi.testclient import TestClient
from database.models import Hospital
from sqlalchemy.orm import Session


class TestMalmquistEndpoint:
    """Tests para el endpoint /malmquist"""

    def test_malmquist_success_basic(self, client: TestClient, test_db: Session):
        """
        Test básico del endpoint Malmquist con parámetros predeterminados.
        
        Verifica:
        - Cálculo exitoso con dos años diferentes
        - Estructura correcta de la respuesta
        - Presencia de índices Malmquist en los resultados
        - Métricas agregadas correctas
        """
        # Crear hospitales para año t (2014)
        hospitales_2014 = [
            {
                "hospital_id": 101100,
                "region_id": 15,
                "hospital_name": "Hospital Dr. Juan Noé Crevanni (Arica)",
                "hospital_alternative_name": "Hospital Doctor Juan Noé",
                "latitud": -18.4827,
                "longitud": -70.3126,
                "consultas": 184208,
                "grdxegresos": 11953.83,
                "bienesyservicios": 19779704,
                "remuneraciones": 10982608,
                "diascamadisponibles": 113311,
                "consultasurgencias": 139557,
                "examenes": 898535,
                "quirofanos": 178,
                "año": 2014,
                "complejidad": 3
            },
            {
                "hospital_id": 102100,
                "region_id": 1,
                "hospital_name": "Hospital Dr. Ernesto Torres Galdames (Iquique)",
                "hospital_alternative_name": "Hospital Iquique",
                "latitud": -20.2139,
                "longitud": -70.1383,
                "consultas": 149392,
                "grdxegresos": 13810.488,
                "bienesyservicios": 27881106,
                "remuneraciones": 15394204,
                "diascamadisponibles": 161383,
                "consultasurgencias": 104376,
                "examenes": 756183,
                "quirofanos": 9,
                "año": 2014,
                "complejidad": 3
            },
            {
                "hospital_id": 103100,
                "region_id": 2,
                "hospital_name": "Hospital Dr. Leonardo Guzmán (Antofagasta)",
                "hospital_alternative_name": "Hospital de Antofagasta",
                "latitud": -23.6597,
                "longitud": -70.3959,
                "consultas": 154729,
                "grdxegresos": 15613.328,
                "bienesyservicios": 29969438,
                "remuneraciones": 15065061,
                "diascamadisponibles": 196717,
                "consultasurgencias": 55364,
                "examenes": 897022,
                "quirofanos": 0,
                "año": 2014,
                "complejidad": 3
            }
        ]
        
        # Crear hospitales para año t+1 (2016) - mismo hospital_id, datos diferentes
        hospitales_2016 = [
            {
                "hospital_id": 101100,
                "region_id": 15,
                "hospital_name": "Hospital Dr. Juan Noé Crevanni (Arica)",
                "hospital_alternative_name": "Hospital Doctor Juan Noé",
                "latitud": -18.4827,
                "longitud": -70.3126,
                "consultas": 190000,
                "grdxegresos": 12500.0,
                "bienesyservicios": 20000000,
                "remuneraciones": 11500000,
                "diascamadisponibles": 115000,
                "consultasurgencias": 145000,
                "examenes": 920000,
                "quirofanos": 180,
                "año": 2016,
                "complejidad": 3
            },
            {
                "hospital_id": 102100,
                "region_id": 1,
                "hospital_name": "Hospital Dr. Ernesto Torres Galdames (Iquique)",
                "hospital_alternative_name": "Hospital Iquique",
                "latitud": -20.2139,
                "longitud": -70.1383,
                "consultas": 155000,
                "grdxegresos": 14200.0,
                "bienesyservicios": 28500000,
                "remuneraciones": 16000000,
                "diascamadisponibles": 165000,
                "consultasurgencias": 108000,
                "examenes": 780000,
                "quirofanos": 10,
                "año": 2016,
                "complejidad": 3
            },
            {
                "hospital_id": 103100,
                "region_id": 2,
                "hospital_name": "Hospital Dr. Leonardo Guzmán (Antofagasta)",
                "hospital_alternative_name": "Hospital de Antofagasta",
                "latitud": -23.6597,
                "longitud": -70.3959,
                "consultas": 160000,
                "grdxegresos": 16000.0,
                "bienesyservicios": 30500000,
                "remuneraciones": 15800000,
                "diascamadisponibles": 200000,
                "consultasurgencias": 58000,
                "examenes": 920000,
                "quirofanos": 1,
                "año": 2016,
                "complejidad": 3
            }
        ]
        
        # Para pruebas de Malmquist necesitamos los mismos hospital_id en diferentes años
        # Crear una tabla temporal sin constraint de PK único
        from sqlalchemy import text
        
        # Recrear tabla sin PK constraint
        test_db.execute(text("DROP TABLE IF EXISTS hospitals"))
        test_db.execute(text("""
            CREATE TABLE hospitals (
                hospital_id INTEGER,
                region_id INTEGER,
                hospital_name TEXT,
                hospital_alternative_name TEXT,
                latitud REAL,
                longitud REAL,
                consultas INTEGER,
                grdxegresos REAL,
                bienesyservicios INTEGER,
                remuneraciones INTEGER,
                diascamadisponibles INTEGER,
                consultasurgencias INTEGER,
                examenes REAL,
                quirofanos REAL,
                año INTEGER,
                complejidad INTEGER
            )
        """))
        test_db.commit()
        
        # Insertar hospitales usando SQL directo
        for hospital_data in hospitales_2014 + hospitales_2016:
            sql = text("""
                INSERT INTO hospitals 
                (hospital_id, region_id, hospital_name, hospital_alternative_name,
                 latitud, longitud, consultas, grdxegresos, bienesyservicios, 
                 remuneraciones, diascamadisponibles, consultasurgencias, 
                 examenes, quirofanos, año, complejidad)
                VALUES (:hospital_id, :region_id, :hospital_name, :hospital_alternative_name,
                        :latitud, :longitud, :consultas, :grdxegresos, :bienesyservicios,
                        :remuneraciones, :diascamadisponibles, :consultasurgencias,
                        :examenes, :quirofanos, :año, :complejidad)
            """)
            test_db.execute(sql, hospital_data)
        test_db.commit()
        
        # Llamar al endpoint Malmquist
        response = client.get("/malmquist?year_t=2014&year_t1=2016")
        
        # Verificaciones básicas
        assert response.status_code == 200
        data = response.json()
        
        # Verificar estructura de respuesta
        assert "results" in data
        assert "metrics" in data
        assert "analysis_info" in data
        assert "summary" in data
        
        # Verificar que hay resultados
        results = data["results"]
        assert isinstance(results, list)
        assert len(results) == 3  # Los 3 hospitales comunes
        
        # Verificar índices Malmquist en cada resultado
        for result in results:
            # Índices de Malmquist
            assert "EFF_t" in result
            assert "EFF_t1" in result  
            assert "EFFCH" in result
            assert "TECH" in result
            assert "Malmquist" in result
            assert "%ΔProd" in result
            
            # Información del hospital
            assert "hospital_id" in result
            assert "hospital_name" in result
            assert "latitud" in result
            assert "longitud" in result
            assert "region_id" in result
            assert "complejidad" in result
            
            # Verificar tipos de datos
            assert isinstance(result["EFF_t"], (int, float))
            assert isinstance(result["EFF_t1"], (int, float))
            assert isinstance(result["EFFCH"], (int, float))
            assert isinstance(result["TECH"], (int, float))
            assert isinstance(result["Malmquist"], (int, float))
            assert isinstance(result["%ΔProd"], (int, float))
            
            # Verificar que los hospital_id son los esperados
            assert result["hospital_id"] in [101100, 102100, 103100]
        
        # Verificar métricas agregadas
        metrics = data["metrics"]
        expected_metrics = [
            "delta_prod_promedio", "delta_eficiencia_promedio", "delta_tecnologia_promedio",
            "pct_hosp_mejorados", "malmquist_mean", "malmquist_median", "malmquist_std",
            "productivity_improved", "productivity_declined", "productivity_unchanged", "n_hospitals"
        ]
        for metric in expected_metrics:
            assert metric in metrics
            assert isinstance(metrics[metric], (int, float))
        
        assert metrics["n_hospitals"] == 3
        
        # Verificar información del análisis
        analysis_info = data["analysis_info"]
        assert analysis_info["year_t"] == 2014
        assert analysis_info["year_t1"] == 2016
        assert analysis_info["hospitals_t_count"] == 3
        assert analysis_info["hospitals_t1_count"] == 3
        assert analysis_info["input_columns"] == ["bienesyservicios", "remuneraciones"]
        assert analysis_info["output_columns"] == ["consultas"]
        assert analysis_info["top_input_column"] == "remuneraciones"

    def test_malmquist_validation_same_years(self, client: TestClient, test_db: Session):
        """
        Test de validación cuando se proporcionan años iguales.
        
        Verifica:
        - Error HTTP 400 cuando year_t == year_t1
        - Mensaje de error apropiado
        """
        response = client.get("/malmquist?year_t=2014&year_t1=2014")
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Los años deben ser diferentes" in data["detail"]

    def test_malmquist_validation_invalid_top_input_col(self, client: TestClient, test_db: Session):
        """
        Test de validación con top_input_col inválido.
        
        Verifica:
        - Error HTTP 400 cuando top_input_col no está en input_cols
        - Mensaje de error apropiado
        """
        # Crear datos básicos para que llegue a la validación
        hospital_data = {
            "hospital_id": 1,
            "region_id": 1,
            "hospital_name": "Test Hospital",
            "latitud": -33.0,
            "longitud": -70.0,
            "consultas": 1000,
            "bienesyservicios": 100000,
            "remuneraciones": 50000,
            "año": 2014,
            "complejidad": 1
        }
        
        hospital = Hospital(**hospital_data)
        test_db.add(hospital)
        test_db.commit()
        
        response = client.get("/malmquist?year_t=2014&year_t1=2016&top_input_col=columna_inexistente")
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "top_input_col" in data["detail"]
        assert "debe estar en input_cols" in data["detail"]

    def test_malmquist_no_hospitals_year_t(self, client: TestClient, test_db: Session):
        """
        Test cuando no hay hospitales para year_t.
        
        Verifica:
        - Error HTTP 404 cuando no hay datos para el año inicial
        - Mensaje de error específico
        """
        response = client.get("/malmquist?year_t=1990&year_t1=2014")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "No se encontraron hospitales para el año 1990" in data["detail"]

    def test_malmquist_no_hospitals_year_t1(self, client: TestClient, test_db: Session):
        """
        Test cuando no hay hospitales para year_t1.
        
        Verifica:
        - Error HTTP 404 cuando no hay datos para el año final
        - Mensaje de error específico
        """
        # Crear hospital solo para 2014
        hospital_data = {
            "hospital_id": 1,
            "region_id": 1,
            "hospital_name": "Test Hospital",
            "latitud": -33.0,
            "longitud": -70.0,
            "consultas": 1000,
            "bienesyservicios": 100000,
            "remuneraciones": 50000,
            "año": 2014,
            "complejidad": 1
        }
        
        hospital = Hospital(**hospital_data)
        test_db.add(hospital)
        test_db.commit()
        
        response = client.get("/malmquist?year_t=2014&year_t1=1995")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "No se encontraron hospitales para el año 1995" in data["detail"]

    def test_malmquist_custom_parameters(self, client: TestClient, test_db: Session):
        """
        Test del endpoint Malmquist con parámetros personalizados.
        
        Verifica:
        - Funcionamiento con inputs y outputs personalizados
        - Diferentes años
        - top_input_col personalizado
        """
        # Crear hospitales para 2013 y 2015
        hospitales_data = [
            # 2013
            {
                "hospital_id": 201,
                "region_id": 1,
                "hospital_name": "Hospital Custom 1",
                "hospital_alternative_name": "Hospital Custom 1 Alt",
                "latitud": -30.0,
                "longitud": -71.0,
                "consultas": 80000,
                "grdxegresos": 5000.0,
                "bienesyservicios": 8000000,
                "remuneraciones": 4000000,
                "diascamadisponibles": 50000,
                "consultasurgencias": 25000,
                "examenes": 200000,
                "quirofanos": 15,
                "año": 2013,
                "complejidad": 2
            },
            {
                "hospital_id": 202,
                "region_id": 2,
                "hospital_name": "Hospital Custom 2",
                "hospital_alternative_name": "Hospital Custom 2 Alt",
                "latitud": -32.0,
                "longitud": -72.0,
                "consultas": 90000,
                "grdxegresos": 6000.0,
                "bienesyservicios": 9000000,
                "remuneraciones": 5000000,
                "diascamadisponibles": 60000,
                "consultasurgencias": 30000,
                "examenes": 250000,
                "quirofanos": 18,
                "año": 2013,
                "complejidad": 3
            },
            # 2015
            {
                "hospital_id": 201,
                "region_id": 1,
                "hospital_name": "Hospital Custom 1",
                "hospital_alternative_name": "Hospital Custom 1 Alt",
                "latitud": -30.0,
                "longitud": -71.0,
                "consultas": 85000,
                "grdxegresos": 5200.0,
                "bienesyservicios": 8200000,
                "remuneraciones": 4200000,
                "diascamadisponibles": 52000,
                "consultasurgencias": 26000,
                "examenes": 210000,
                "quirofanos": 16,
                "año": 2015,
                "complejidad": 2
            },
            {
                "hospital_id": 202,
                "region_id": 2,
                "hospital_name": "Hospital Custom 2",
                "hospital_alternative_name": "Hospital Custom 2 Alt",
                "latitud": -32.0,
                "longitud": -72.0,
                "consultas": 95000,
                "grdxegresos": 6300.0,
                "bienesyservicios": 9300000,
                "remuneraciones": 5300000,
                "diascamadisponibles": 63000,
                "consultasurgencias": 32000,
                "examenes": 265000,
                "quirofanos": 20,
                "año": 2015,
                "complejidad": 3
            }
        ]
        
        # Crear tabla temporal sin constraint de PK único para Malmquist
        from sqlalchemy import text
        
        # Recrear tabla sin PK constraint
        test_db.execute(text("DROP TABLE IF EXISTS hospitals"))
        test_db.execute(text("""
            CREATE TABLE hospitals (
                hospital_id INTEGER,
                region_id INTEGER,
                hospital_name TEXT,
                hospital_alternative_name TEXT,
                latitud REAL,
                longitud REAL,
                consultas INTEGER,
                grdxegresos REAL,
                bienesyservicios INTEGER,
                remuneraciones INTEGER,
                diascamadisponibles INTEGER,
                consultasurgencias INTEGER,
                examenes REAL,
                quirofanos REAL,
                año INTEGER,
                complejidad INTEGER
            )
        """))
        test_db.commit()
        
        # Insertar hospitales usando SQL directo
        for hospital_data in hospitales_data:
            sql = text("""
                INSERT INTO hospitals 
                (hospital_id, region_id, hospital_name, hospital_alternative_name,
                 latitud, longitud, consultas, grdxegresos, bienesyservicios, 
                 remuneraciones, diascamadisponibles, consultasurgencias, 
                 examenes, quirofanos, año, complejidad)
                VALUES (:hospital_id, :region_id, :hospital_name, :hospital_alternative_name,
                        :latitud, :longitud, :consultas, :grdxegresos, :bienesyservicios,
                        :remuneraciones, :diascamadisponibles, :consultasurgencias,
                        :examenes, :quirofanos, :año, :complejidad)
            """)
            test_db.execute(sql, hospital_data)
        test_db.commit()
        
        # Llamar con parámetros personalizados
        params = {
            "year_t": 2013,
            "year_t1": 2015,
            "input_cols": "bienesyservicios,remuneraciones,diascamadisponibles",
            "output_cols": "consultas,grdxegresos",
            "top_input_col": "bienesyservicios"
        }
        response = client.get("/malmquist", params=params)
        
        # Verificaciones
        assert response.status_code == 200
        data = response.json()
        
        # Verificar estructura básica
        assert "results" in data
        assert "metrics" in data
        assert len(data["results"]) == 2
        
        # Verificar que los parámetros se reflejan en analysis_info
        analysis_info = data["analysis_info"]
        assert analysis_info["year_t"] == 2013
        assert analysis_info["year_t1"] == 2015
        assert analysis_info["input_columns"] == ["bienesyservicios", "remuneraciones", "diascamadisponibles"]
        assert analysis_info["output_columns"] == ["consultas", "grdxegresos"]
        assert analysis_info["top_input_column"] == "bienesyservicios"
        
        # Verificar métricas
        assert data["metrics"]["n_hospitals"] == 2
