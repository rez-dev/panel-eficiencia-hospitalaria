"""
Tests para endpoints de análisis de eficiencia.
"""
import pytest
from sqlalchemy.orm import Session
from database.models import Hospital
from fastapi.testclient import TestClient


class TestSFAEndpoint:
    """Tests para el endpoint /sfa de análisis de eficiencia técnica."""
    
    def test_sfa_endpoint_success(self, client: TestClient, test_db: Session):
        """Test básico del endpoint /sfa con datos válidos."""
        # Crear algunos hospitales para el año 2014
        hospitals_data = [
            {
                "hospital_id": 1,
                "region_id": 1,
                "hospital_name": "Hospital A",
                "latitud": -33.4489,
                "longitud": -70.6693,
                "consultas": 1000,
                "grdxegresos": 50.5,
                "bienesyservicios": 50000,
                "remuneraciones": 100000,
                "diascamadisponibles": 365,
                "consultasurgencias": 500,
                "examenes": 200.5,
                "quirofanos": 5.0,
                "año": 2014,
                "complejidad": 3
            },
            {
                "hospital_id": 2,
                "region_id": 2,
                "hospital_name": "Hospital B",
                "latitud": -36.8485,
                "longitud": -73.0542,
                "consultas": 1500,
                "grdxegresos": 75.5,
                "bienesyservicios": 75000,
                "remuneraciones": 150000,
                "diascamadisponibles": 400,
                "consultasurgencias": 750,
                "examenes": 300.5,
                "quirofanos": 7.0,
                "año": 2014,
                "complejidad": 4
            }
        ]
        
        # Insertar hospitales en la base de datos
        for hospital_data in hospitals_data:
            hospital = Hospital(**hospital_data)
            test_db.add(hospital)
        test_db.commit()
        
        # Hacer petición al endpoint
        response = client.get("/sfa?year=2014")
        
        # Verificaciones básicas
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "metrics" in data
        
        # Verificar que tenemos resultados
        results = data["results"]
        assert len(results) > 0
        
        # Verificar que cada resultado tiene eficiencia SFA
        for result in results:
            assert "ET SFA" in result
            assert isinstance(result["ET SFA"], (int, float))
        
        # Verificar que las métricas existen
        metrics = data["metrics"]
        assert "year" in metrics
        assert metrics["year"] == 2014
    
    def test_sfa_endpoint_no_hospitals(self, client: TestClient, test_db: Session):
        """Test cuando no hay hospitales para el año especificado."""
        response = client.get("/sfa?year=2023")
        
        # Debe retornar error
        assert response.status_code == 404
    
    def test_sfa_endpoint_with_parameters(self, client: TestClient, test_db: Session):
        """Test con parámetros personalizados."""
        # Crear varios hospitales para que SFA pueda funcionar
        hospitals = [
            Hospital(
                hospital_id=100,
                region_id=1,
                hospital_name="Hospital Params 1",
                latitud=-33.4489,
                longitud=-70.6693,
                consultas=1000,
                grdxegresos=50.5,
                bienesyservicios=50000,
                remuneraciones=100000,
                diascamadisponibles=365,
                consultasurgencias=500,
                examenes=200.5,
                quirofanos=5.0,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=101,
                region_id=2,
                hospital_name="Hospital Params 2",
                latitud=-36.8485,
                longitud=-73.0542,
                consultas=1500,
                grdxegresos=75.5,
                bienesyservicios=75000,
                remuneraciones=150000,
                diascamadisponibles=400,
                consultasurgencias=750,
                examenes=300.5,
                quirofanos=7.0,
                año=2014,
                complejidad=4
            )
        ]
        
        for hospital in hospitals:
            test_db.add(hospital)
        test_db.commit()
        
        # Test con parámetros diferentes
        response = client.get("/sfa?year=2014&input_cols=remuneraciones&output_cols=consultas")
        
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "metrics" in data
