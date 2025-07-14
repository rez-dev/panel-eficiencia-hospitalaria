"""
Tests para el endpoint /pca - Análisis de Componentes Principales (PCA)

Tests esenciales para verificar el funcionamiento del endpoint de análisis PCA.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from database.models import Hospital

def test_pca_default_success(client: TestClient, test_db: Session):
    """Test básico del endpoint PCA con parámetros por defecto."""
    # Crear hospitales de prueba
    hospitales_test = [
        Hospital(
            hospital_id=101100, region_id=15, hospital_name="Hospital Arica",
            latitud=-18.4827, longitud=-70.3126, consultas=184208, grdxegresos=11953.83,
            bienesyservicios=19779704, remuneraciones=10982608, diascamadisponibles=113311,
            consultasurgencias=139557, examenes=898535, quirofanos=178, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=102100, region_id=1, hospital_name="Hospital Iquique",
            latitud=-20.2139, longitud=-70.1383, consultas=149392, grdxegresos=13810.488,
            bienesyservicios=27881106, remuneraciones=15394204, diascamadisponibles=161383,
            consultasurgencias=104376, examenes=756183, quirofanos=9, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=103100, region_id=2, hospital_name="Hospital Antofagasta",
            latitud=-23.6597, longitud=-70.3959, consultas=154729, grdxegresos=15613.328,
            bienesyservicios=29969438, remuneraciones=15065061, diascamadisponibles=196717,
            consultasurgencias=55364, examenes=897022, quirofanos=12, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=104100, region_id=3, hospital_name="Hospital Copiapó",
            latitud=-27.3668, longitud=-70.3323, consultas=98500, grdxegresos=8200.5,
            bienesyservicios=15000000, remuneraciones=12000000, diascamadisponibles=95000,
            consultasurgencias=75000, examenes=520000, quirofanos=8, año=2014, complejidad=2
        ),
        Hospital(
            hospital_id=105100, region_id=4, hospital_name="Hospital La Serena",
            latitud=-29.9058, longitud=-71.2501, consultas=125000, grdxegresos=9500.2,
            bienesyservicios=18500000, remuneraciones=13500000, diascamadisponibles=110000,
            consultasurgencias=89000, examenes=620000, quirofanos=10, año=2014, complejidad=2
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verificar estructura principal
    assert "results" in data
    assert "metrics" in data
    assert "components_matrix" in data
    
    # Verificar metrics
    metrics = data["metrics"]
    assert metrics["year"] == 2014
    assert metrics["n_components"] == 2
    assert metrics["scale_applied"] == True
    assert len(metrics["feature_cols"]) == 4
    assert metrics["total_variance_explained"] > 0
    
    # Verificar results y components
    assert len(data["results"]) > 0
    assert "PC1" in data["results"][0]
    assert "PC2" in data["results"][0]
    assert len(data["components_matrix"]) == 2

def test_pca_custom_parameters(client: TestClient, test_db: Session):
    """Test con parámetros personalizados."""
    # Crear hospitales de prueba
    hospitales_test = [
        Hospital(
            hospital_id=201100, region_id=15, hospital_name="Hospital Test 1",
            latitud=-18.4827, longitud=-70.3126, consultas=184208, grdxegresos=11953.83,
            bienesyservicios=19779704, remuneraciones=10982608, diascamadisponibles=113311,
            consultasurgencias=139557, examenes=898535, quirofanos=178, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=202100, region_id=1, hospital_name="Hospital Test 2",
            latitud=-20.2139, longitud=-70.1383, consultas=149392, grdxegresos=13810.488,
            bienesyservicios=27881106, remuneraciones=15394204, diascamadisponibles=161383,
            consultasurgencias=104376, examenes=756183, quirofanos=9, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=203100, region_id=2, hospital_name="Hospital Test 3",
            latitud=-23.6597, longitud=-70.3959, consultas=154729, grdxegresos=15613.328,
            bienesyservicios=29969438, remuneraciones=15065061, diascamadisponibles=196717,
            consultasurgencias=55364, examenes=897022, quirofanos=12, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=204100, region_id=3, hospital_name="Hospital Test 4",
            latitud=-27.3668, longitud=-70.3323, consultas=98500, grdxegresos=8200.5,
            bienesyservicios=15000000, remuneraciones=12000000, diascamadisponibles=95000,
            consultasurgencias=75000, examenes=520000, quirofanos=8, año=2014, complejidad=2
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca?n_components=3&scale=false&feature_cols=consultas,remuneraciones,bienesyservicios")
    
    assert response.status_code == 200
    data = response.json()
    
    metrics = data["metrics"]
    assert metrics["n_components"] == 3
    assert metrics["scale_applied"] == False
    assert len(metrics["feature_cols"]) == 3
    assert "PC3" in data["results"][0]

def test_pca_different_year(client: TestClient, test_db: Session):
    """Test con año diferente."""
    # Crear hospitales de prueba para 2016
    hospitales_test = [
        Hospital(
            hospital_id=301100, region_id=15, hospital_name="Hospital 2016 Test 1",
            latitud=-18.4827, longitud=-70.3126, consultas=190000, grdxegresos=12000.0,
            bienesyservicios=20000000, remuneraciones=11000000, diascamadisponibles=115000,
            consultasurgencias=140000, examenes=900000, quirofanos=180, año=2016, complejidad=3
        ),
        Hospital(
            hospital_id=302100, region_id=1, hospital_name="Hospital 2016 Test 2",
            latitud=-20.2139, longitud=-70.1383, consultas=155000, grdxegresos=14000.0,
            bienesyservicios=28000000, remuneraciones=16000000, diascamadisponibles=165000,
            consultasurgencias=110000, examenes=780000, quirofanos=10, año=2016, complejidad=3
        ),
        Hospital(
            hospital_id=303100, region_id=2, hospital_name="Hospital 2016 Test 3",
            latitud=-23.6597, longitud=-70.3959, consultas=160000, grdxegresos=16000.0,
            bienesyservicios=30000000, remuneraciones=15500000, diascamadisponibles=200000,
            consultasurgencias=60000, examenes=920000, quirofanos=13, año=2016, complejidad=3
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca?year=2016")
    
    assert response.status_code == 200
    data = response.json()
    assert data["metrics"]["year"] == 2016

def test_pca_invalid_year(client: TestClient, test_db: Session):
    """Test con año inexistente."""
    response = client.get("/pca?year=9999")
    
    assert response.status_code == 404
    assert "No se encontraron hospitales" in response.json()["detail"]

def test_pca_invalid_columns(client: TestClient, test_db: Session):
    """Test con columnas inexistentes."""
    # Crear algunos hospitales para que el test llegue hasta la validación de columnas
    hospitales_test = [
        Hospital(
            hospital_id=401100, region_id=15, hospital_name="Hospital Columnas Test",
            latitud=-18.4827, longitud=-70.3126, consultas=184208, grdxegresos=11953.83,
            bienesyservicios=19779704, remuneraciones=10982608, diascamadisponibles=113311,
            consultasurgencias=139557, examenes=898535, quirofanos=178, año=2014, complejidad=3
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca?feature_cols=columna_falsa,otra_falsa")
    
    assert response.status_code == 400
    assert "Columnas no encontradas para PCA" in response.json()["detail"]

def test_pca_validation_errors(client: TestClient, test_db: Session):
    """Test de validación de parámetros."""
    # n_components fuera de rango
    response = client.get("/pca?n_components=0")
    assert response.status_code == 422
    
    response = client.get("/pca?n_components=11")
    assert response.status_code == 422
