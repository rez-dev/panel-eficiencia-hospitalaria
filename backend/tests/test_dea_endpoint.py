"""
Pruebas para el endpoint DEA (Data Envelopment Analysis).

Tests que cubren:
- Funcionalidad básica con parámetros predeterminados
- Manejo de casos sin hospitales para el año especificado
- Validación de parámetros personalizados de entrada y salida
"""

import pytest
from fastapi.testclient import TestClient
from database.models import Hospital
from sqlalchemy.orm import Session


class TestDEAEndpoint:
    """Conjunto de pruebas para el endpoint /dea"""

    def test_dea_success_default_params(self, client: TestClient, test_db: Session):
        """
        Prueba que el endpoint DEA funcione correctamente con parámetros predeterminados.
        
        Verifica:
        - Respuesta HTTP 200
        - Estructura correcta de la respuesta (results y metrics)
        - Presencia de eficiencia técnica DEA en los resultados
        - Métricas esperadas del análisis DEA
        """
        # Crear hospitales de prueba para el análisis DEA (datos reales)
        hospitales_prueba = [
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
        
        # Insertar hospitales en la base de datos
        for hospital_data in hospitales_prueba:
            hospital = Hospital(**hospital_data)
            test_db.add(hospital)
        test_db.commit()
        
        # Llamar al endpoint DEA
        response = client.get("/dea")
        
        # Verificar que la respuesta no tenga errores de servidor
        if response.status_code != 200:
            print(f"Error en respuesta: {response.status_code}")
            print(f"Contenido: {response.text}")
        
        # Verificaciones básicas
        assert response.status_code == 200
        data = response.json()
        
        # Verificar estructura de respuesta
        assert "results" in data
        assert "metrics" in data
        assert isinstance(data["results"], list)
        assert isinstance(data["metrics"], dict)
        
        # Verificar que hay resultados
        assert len(data["results"]) == 3
        
        # Verificar que cada hospital tiene eficiencia técnica DEA
        for result in data["results"]:
            assert "ET DEA" in result
            assert isinstance(result["ET DEA"], (int, float))
            assert result["ET DEA"] >= 0
            # En DEA, la eficiencia técnica está entre 0 y 1
            assert result["ET DEA"] <= 1
        
        # Verificar métricas del análisis DEA
        metrics = data["metrics"]
        assert "et_promedio" in metrics
        assert "pct_criticos" in metrics  
        assert "top_slack_promedio" in metrics
        assert "year" in metrics
        assert "input_cols" in metrics
        assert "output_cols" in metrics
        
        # Verificar tipos de métricas
        assert isinstance(metrics["et_promedio"], (int, float))
        assert isinstance(metrics["pct_criticos"], (int, float))
        assert isinstance(metrics["top_slack_promedio"], str)
        assert metrics["year"] == 2014
        assert metrics["input_cols"] == ['bienesyservicios', 'remuneraciones', 'diascamadisponibles']
        assert metrics["output_cols"] == ['consultas']

    def test_dea_no_hospitals_found(self, client: TestClient, test_db: Session):
        """
        Prueba el manejo de casos donde no hay hospitales para el año especificado.
        
        Verifica:
        - Respuesta HTTP 404
        - Mensaje de error apropiado
        """
        # Llamar al endpoint DEA para un año sin hospitales
        response = client.get("/dea?year=1990")
        
        # Verificar respuesta de error
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "No se encontraron hospitales para el año 1990" in data["detail"]

    def test_dea_custom_parameters(self, client: TestClient, test_db: Session):
        """
        Prueba el endpoint DEA con parámetros personalizados.
        
        Verifica:
        - Funcionamiento con inputs y outputs personalizados
        - Año diferente al predeterminado
        - Respuesta correcta con nuevos parámetros
        """
        # Crear hospitales de prueba para 2015 (datos similares a los reales)
        hospitales_prueba = [
            {
                "hospital_id": 201100,
                "region_id": 15,
                "hospital_name": "Hospital Dr. Juan Noé Crevanni (Arica)",
                "hospital_alternative_name": "Hospital Doctor Juan Noé",
                "latitud": -18.4827,
                "longitud": -70.3126,
                "consultas": 190000,
                "grdxegresos": 12000.0,
                "bienesyservicios": 20000000,
                "remuneraciones": 11000000,
                "diascamadisponibles": 115000,
                "consultasurgencias": 140000,
                "examenes": 900000,
                "quirofanos": 180,
                "año": 2015,
                "complejidad": 3
            },
            {
                "hospital_id": 202100,
                "region_id": 1,
                "hospital_name": "Hospital Dr. Ernesto Torres Galdames (Iquique)",
                "hospital_alternative_name": "Hospital Iquique",
                "latitud": -20.2139,
                "longitud": -70.1383,
                "consultas": 155000,
                "grdxegresos": 14000.0,
                "bienesyservicios": 28000000,
                "remuneraciones": 16000000,
                "diascamadisponibles": 165000,
                "consultasurgencias": 105000,
                "examenes": 760000,
                "quirofanos": 10,
                "año": 2015,
                "complejidad": 3
            },
            {
                "hospital_id": 203100,
                "region_id": 2,
                "hospital_name": "Hospital Dr. Leonardo Guzmán (Antofagasta)",
                "hospital_alternative_name": "Hospital de Antofagasta",
                "latitud": -23.6597,
                "longitud": -70.3959,
                "consultas": 160000,
                "grdxegresos": 16000.0,
                "bienesyservicios": 30000000,
                "remuneraciones": 15500000,
                "diascamadisponibles": 200000,
                "consultasurgencias": 56000,
                "examenes": 900000,
                "quirofanos": 1,
                "año": 2015,
                "complejidad": 3
            }
        ]
        
        # Insertar hospitales en la base de datos
        for hospital_data in hospitales_prueba:
            hospital = Hospital(**hospital_data)
            test_db.add(hospital)
        test_db.commit()
        
        # Llamar al endpoint DEA con parámetros personalizados
        params = {
            "year": 2015,
            "input_cols": "bienesyservicios,remuneraciones",
            "output_cols": "consultas,grdxegresos"
        }
        response = client.get("/dea", params=params)
        
        # Verificaciones
        assert response.status_code == 200
        data = response.json()
        
        # Verificar estructura básica
        assert "results" in data
        assert "metrics" in data
        assert len(data["results"]) == 3
        
        # Verificar eficiencia técnica DEA presente
        for result in data["results"]:
            assert "ET DEA" in result
            assert 0 <= result["ET DEA"] <= 1
        
        # Verificar que los parámetros personalizados se reflejan en las métricas
        metrics = data["metrics"]
        assert metrics["year"] == 2015
        assert metrics["input_cols"] == ["bienesyservicios", "remuneraciones"]
        assert metrics["output_cols"] == ["consultas", "grdxegresos"]
        
        # Verificar métricas esperadas del DEA
        assert "et_promedio" in metrics
        assert "pct_criticos" in metrics
        assert "top_slack_promedio" in metrics
        assert isinstance(metrics["et_promedio"], (int, float))
        assert isinstance(metrics["pct_criticos"], (int, float))
