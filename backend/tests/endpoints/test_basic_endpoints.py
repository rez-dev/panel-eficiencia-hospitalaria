"""
Pruebas para endpoints básicos del API de eficiencia hospitalaria.

Cubre los endpoints de utilidad y gestión básica:
- /health: Health check del sistema
- /: Endpoint raíz
- /db-status: Estado de conectividad de base de datos
- /hospitals: Obtener todos los hospitales con filtros
- /hospitals/{hospital_id}: Obtener hospital específico por ID
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from database import models


def test_health_check(client: TestClient):
    """Prueba el endpoint de health check del sistema."""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verificar estructura de respuesta
    assert "status" in data
    assert "service" in data
    assert "version" in data
    assert "environment" in data
    
    # Verificar valores esperados
    assert data["status"] == "healthy"
    assert data["service"] == "Panel Eficiencia Hospitalaria API"
    assert data["version"] == "1.0.0"
    assert data["environment"] in ["development", "production", "test"]


def test_read_root(client: TestClient):
    """Prueba el endpoint raíz del API."""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "message" in data
    assert "Hello World - Connected to PostgreSQL!" in data["message"]


def test_db_status_success(client: TestClient, test_db: Session):
    """Prueba el endpoint de estado de base de datos con conexión exitosa."""
    response = client.get("/db-status")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verificar estructura de respuesta
    assert "status" in data
    assert "message" in data
    assert "result" in data
    
    # Verificar valores de conexión exitosa
    assert data["status"] == "connected"
    assert "PostgreSQL conectada correctamente" in data["message"]
    assert data["result"] == 1  # Resultado de SELECT 1


def test_get_all_hospitals_without_filters(client: TestClient, test_db: Session):
    """Prueba obtener todos los hospitales sin filtros."""
    # Crear hospitales de prueba
    hospital1 = models.Hospital(
        hospital_id=1,
        hospital_name="Hospital Metropolitano",
        region_id=13,
        año=2014,
        complejidad=3,
        consultas=50000,
        grdxegresos=15000.5,
        bienesyservicios=2000000,
        remuneraciones=3500000,
        diascamadisponibles=300,
        consultasurgencias=25000,
        examenes=75000.2,
        quirofanos=8.0,
        latitud=-33.4489,
        longitud=-70.6693
    )
    
    hospital2 = models.Hospital(
        hospital_id=2,
        hospital_name="Hospital Regional Norte",
        region_id=1,
        año=2015,
        complejidad=2,
        consultas=30000,
        grdxegresos=8000.3,
        bienesyservicios=1200000,
        remuneraciones=2000000,
        diascamadisponibles=150,
        consultasurgencias=15000,
        examenes=45000.8,
        quirofanos=5.0,
        latitud=-18.4783,
        longitud=-70.3126
    )
    
    test_db.add_all([hospital1, hospital2])
    test_db.commit()
    
    response = client.get("/hospitals")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 2
    assert data[0]["hospital_name"] == "Hospital Metropolitano"
    assert data[1]["hospital_name"] == "Hospital Regional Norte"


def test_get_hospitals_with_year_filter(client: TestClient, test_db: Session):
    """Prueba obtener hospitales filtrados por año."""
    # Crear hospitales de diferentes años
    hospital_2014 = models.Hospital(
        hospital_id=10,
        hospital_name="Hospital 2014",
        region_id=5,
        año=2014,
        complejidad=1,
        consultas=20000,
        grdxegresos=5000.0,
        bienesyservicios=800000,
        remuneraciones=1500000,
        diascamadisponibles=100,
        consultasurgencias=10000,
        examenes=30000.0,
        quirofanos=3.0,
        latitud=-36.8201,
        longitud=-73.0444
    )
    
    hospital_2015 = models.Hospital(
        hospital_id=11,
        hospital_name="Hospital 2015",
        region_id=8,
        año=2015,
        complejidad=2,
        consultas=35000,
        grdxegresos=9000.0,
        bienesyservicios=1300000,
        remuneraciones=2200000,
        diascamadisponibles=180,
        consultasurgencias=18000,
        examenes=50000.0,
        quirofanos=6.0,
        latitud=-38.9489,
        longitud=-72.3316
    )
    
    test_db.add_all([hospital_2014, hospital_2015])
    test_db.commit()
    
    # Probar filtro por año 2014
    response = client.get("/hospitals?year=2014")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 1
    assert data[0]["hospital_name"] == "Hospital 2014"
    assert data[0]["año"] == 2014


def test_get_hospitals_with_region_filter(client: TestClient, test_db: Session):
    """Prueba obtener hospitales filtrados por región."""
    # Crear hospitales de diferentes regiones
    hospital_region_13 = models.Hospital(
        hospital_id=20,
        hospital_name="Hospital RM",
        region_id=13,
        año=2014,
        complejidad=3,
        consultas=60000,
        grdxegresos=18000.0,
        bienesyservicios=2500000,
        remuneraciones=4000000,
        diascamadisponibles=350,
        consultasurgencias=30000,
        examenes=90000.0,
        quirofanos=10.0,
        latitud=-33.4489,
        longitud=-70.6693
    )
    
    hospital_region_5 = models.Hospital(
        hospital_id=21,
        hospital_name="Hospital Valparaíso",
        region_id=5,
        año=2014,
        complejidad=2,
        consultas=25000,
        grdxegresos=7500.0,
        bienesyservicios=1000000,
        remuneraciones=1800000,
        diascamadisponibles=120,
        consultasurgencias=12000,
        examenes=35000.0,
        quirofanos=4.0,
        latitud=-33.0472,
        longitud=-71.6127
    )
    
    test_db.add_all([hospital_region_13, hospital_region_5])
    test_db.commit()
    
    # Probar filtro por región 13 (RM)
    response = client.get("/hospitals?region_id=13")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 1
    assert data[0]["hospital_name"] == "Hospital RM"
    assert data[0]["region_id"] == 13


def test_get_hospitals_with_complejidad_filter(client: TestClient, test_db: Session):
    """Prueba obtener hospitales filtrados por complejidad."""
    # Crear hospitales de diferentes complejidades
    hospital_alta = models.Hospital(
        hospital_id=30,
        hospital_name="Hospital Alta Complejidad",
        region_id=13,
        año=2014,
        complejidad=3,
        consultas=80000,
        grdxegresos=25000.0,
        bienesyservicios=3000000,
        remuneraciones=5000000,
        diascamadisponibles=400,
        consultasurgencias=40000,
        examenes=120000.0,
        quirofanos=12.0,
        latitud=-33.4489,
        longitud=-70.6693
    )
    
    hospital_baja = models.Hospital(
        hospital_id=31,
        hospital_name="Hospital Baja Complejidad",
        region_id=9,
        año=2014,
        complejidad=1,
        consultas=15000,
        grdxegresos=3000.0,
        bienesyservicios=600000,
        remuneraciones=1000000,
        diascamadisponibles=80,
        consultasurgencias=8000,
        examenes=20000.0,
        quirofanos=2.0,
        latitud=-38.7359,
        longitud=-72.5904
    )
    
    test_db.add_all([hospital_alta, hospital_baja])
    test_db.commit()
    
    # Probar filtro por complejidad alta (3)
    response = client.get("/hospitals?complejidad=3")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 1
    assert data[0]["hospital_name"] == "Hospital Alta Complejidad"
    assert data[0]["complejidad"] == 3


def test_get_hospitals_with_multiple_filters(client: TestClient, test_db: Session):
    """Prueba obtener hospitales con múltiples filtros combinados."""
    # Crear varios hospitales
    hospital_match = models.Hospital(
        hospital_id=40,
        hospital_name="Hospital Match",
        region_id=13,
        año=2014,
        complejidad=3,
        consultas=70000,
        grdxegresos=20000.0,
        bienesyservicios=2800000,
        remuneraciones=4500000,
        diascamadisponibles=380,
        consultasurgencias=35000,
        examenes=100000.0,
        quirofanos=11.0,
        latitud=-33.4489,
        longitud=-70.6693
    )
    
    hospital_no_match = models.Hospital(
        hospital_id=41,
        hospital_name="Hospital No Match",
        region_id=5,  # Región diferente
        año=2014,
        complejidad=3,
        consultas=65000,
        grdxegresos=19000.0,
        bienesyservicios=2600000,
        remuneraciones=4200000,
        diascamadisponibles=360,
        consultasurgencias=32000,
        examenes=95000.0,
        quirofanos=10.0,
        latitud=-33.0472,
        longitud=-71.6127
    )
    
    test_db.add_all([hospital_match, hospital_no_match])
    test_db.commit()
    
    # Probar múltiples filtros: año=2014, región=13, complejidad=3
    response = client.get("/hospitals?year=2014&region_id=13&complejidad=3")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 1
    assert data[0]["hospital_name"] == "Hospital Match"


def test_get_hospitals_no_results(client: TestClient, test_db: Session):
    """Prueba obtener hospitales cuando no hay resultados."""
    # Crear un hospital que no coincida con el filtro
    hospital = models.Hospital(
        hospital_id=50,
        hospital_name="Hospital 2014",
        region_id=13,
        año=2014,
        complejidad=2,
        consultas=40000,
        grdxegresos=12000.0,
        bienesyservicios=1800000,
        remuneraciones=2800000,
        diascamadisponibles=200,
        consultasurgencias=20000,
        examenes=60000.0,
        quirofanos=7.0,
        latitud=-33.4489,
        longitud=-70.6693
    )
    
    test_db.add(hospital)
    test_db.commit()
    
    # Buscar con año que no existe
    response = client.get("/hospitals?year=2020")
    
    assert response.status_code == 404
    data = response.json()
    
    assert "detail" in data
    assert "año 2020" in data["detail"]


def test_get_hospitals_no_results_multiple_filters(client: TestClient, test_db: Session):
    """Prueba obtener hospitales con múltiples filtros sin resultados."""
    # Crear un hospital que no coincida con todos los filtros
    hospital = models.Hospital(
        hospital_id=60,
        hospital_name="Hospital Test",
        region_id=5,  # Región diferente a la buscada
        año=2014,
        complejidad=2,  # Complejidad diferente a la buscada
        consultas=30000,
        grdxegresos=9000.0,
        bienesyservicios=1400000,
        remuneraciones=2300000,
        diascamadisponibles=160,
        consultasurgencias=15000,
        examenes=45000.0,
        quirofanos=5.0,
        latitud=-33.0472,
        longitud=-71.6127
    )
    
    test_db.add(hospital)
    test_db.commit()
    
    # Buscar con filtros que no coinciden
    response = client.get("/hospitals?year=2014&region_id=13&complejidad=3")
    
    assert response.status_code == 404
    data = response.json()
    
    assert "detail" in data
    assert "año 2014 y región 13 y complejidad 3" in data["detail"]


def test_get_hospital_by_id_success(client: TestClient, test_db: Session):
    """Prueba obtener un hospital específico por ID exitosamente."""
    hospital = models.Hospital(
        hospital_id=100,
        hospital_name="Hospital Específico",
        region_id=13,
        año=2014,
        complejidad=3,
        consultas=55000,
        grdxegresos=16500.0,
        bienesyservicios=2200000,
        remuneraciones=3800000,
        diascamadisponibles=320,
        consultasurgencias=27000,
        examenes=82000.0,
        quirofanos=9.0,
        latitud=-33.4489,
        longitud=-70.6693
    )
    
    test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/hospitals/100")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["hospital_id"] == 100
    assert data["hospital_name"] == "Hospital Específico"
    assert data["region_id"] == 13
    assert data["complejidad"] == 3


def test_get_hospital_by_id_not_found(client: TestClient, test_db: Session):
    """Prueba obtener un hospital por ID que no existe."""
    response = client.get("/hospitals/999")
    
    assert response.status_code == 404
    data = response.json()
    
    assert "detail" in data
    assert "Hospital con ID 999 no encontrado" in data["detail"]


def test_get_hospital_by_id_invalid_format(client: TestClient):
    """Prueba obtener un hospital con ID en formato inválido."""
    response = client.get("/hospitals/invalid_id")
    
    assert response.status_code == 422  # Unprocessable Entity
    data = response.json()
    
    assert "detail" in data
    # Verificar que es un error de validación de tipo
    assert any("type" in error and "int_parsing" in error.get("type", "") for error in data["detail"])
