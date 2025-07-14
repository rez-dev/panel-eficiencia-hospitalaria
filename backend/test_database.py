"""
Tests de ejemplo para demostrar el uso de la nueva configuración de base de datos.
"""
import pytest
from sqlalchemy.orm import Session
from database.models import Hospital
from database.database import get_database_url


def test_database_configuration():
    """Test para verificar que la configuración de base de datos funciona."""
    db_url = get_database_url()
    assert db_url == "sqlite:///:memory:?check_same_thread=false"


def test_create_hospital(test_db: Session):
    """Test para crear un hospital en la base de datos de test."""
    # Crear un hospital de prueba
    hospital_data = {
        "hospital_id": 1,
        "region_id": 1,
        "hospital_name": "Hospital Test",
        "hospital_alternative_name": "Test Hospital",
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
        "año": 2023,
        "complejidad": 3
    }
    
    hospital = Hospital(**hospital_data)
    test_db.add(hospital)
    test_db.commit()
    test_db.refresh(hospital)
    
    # Verificar que se creó correctamente
    assert hospital.hospital_id == 1
    assert hospital.hospital_name == "Hospital Test"
    
    # Verificar que se puede consultar
    db_hospital = test_db.query(Hospital).filter(Hospital.hospital_id == 1).first()
    assert db_hospital is not None
    assert db_hospital.hospital_name == "Hospital Test"


def test_multiple_hospitals(test_db: Session):
    """Test para verificar que se pueden crear múltiples hospitales."""
    hospitals_data = [
        {
            "hospital_id": 1,
            "region_id": 1,
            "hospital_name": "Hospital 1",
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
            "año": 2023,
            "complejidad": 3
        },
        {
            "hospital_id": 2,
            "region_id": 2,
            "hospital_name": "Hospital 2",
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
            "año": 2023,
            "complejidad": 4
        }
    ]
    
    for hospital_data in hospitals_data:
        hospital = Hospital(**hospital_data)
        test_db.add(hospital)
    
    test_db.commit()
    
    # Verificar que se crearon ambos hospitales
    hospitals = test_db.query(Hospital).all()
    assert len(hospitals) == 2
    
    hospital_names = [h.hospital_name for h in hospitals]
    assert "Hospital 1" in hospital_names
    assert "Hospital 2" in hospital_names


def test_api_endpoint(client):
    """Test para verificar que un endpoint de la API funciona con la base de datos de test."""
    # Hacer una petición a un endpoint (asumiendo que existe)
    response = client.get("/")
    
    # Verificar que la respuesta es exitosa
    assert response.status_code == 200
