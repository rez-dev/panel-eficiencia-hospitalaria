"""
Tests para el endpoint /pca-clustering - Análisis PCA + K-means Clustering

Tests esenciales para verificar el funcionamiento del endpoint de análisis combinado
PCA + K-means clustering para segmentación hospitalaria.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from database.models import Hospital

def test_pca_clustering_default_success(client: TestClient, test_db: Session):
    """Test básico del endpoint PCA+Clustering con parámetros por defecto."""
    # Crear hospitales de prueba (necesitamos varios para clustering)
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
        ),
        Hospital(
            hospital_id=106100, region_id=5, hospital_name="Hospital Valparaíso",
            latitud=-33.0458, longitud=-71.6197, consultas=165000, grdxegresos=10500.3,
            bienesyservicios=22000000, remuneraciones=14500000, diascamadisponibles=125000,
            consultasurgencias=95000, examenes=680000, quirofanos=11, año=2014, complejidad=2
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca-clustering?k=3")  # Usar un número fijo de clusters menor que el número de hospitales
    
    assert response.status_code == 200
    data = response.json()
    
    # Verificar estructura principal
    assert "results" in data
    assert "metrics" in data
    assert "components_matrix" in data
    assert "cluster_centers" in data
    assert "cluster_summary" in data
    
    # Verificar metrics
    metrics = data["metrics"]
    assert metrics["year"] == 2014
    assert metrics["method"] == "DEA"
    assert metrics["n_components"] == 2
    assert metrics["scale_applied"] == True
    assert "efficiency_col" in metrics
    assert "k_clusters" in metrics
    assert "silhouette_score" in metrics
    assert metrics["total_variance_explained"] > 0
    
    # Verificar que los resultados incluyen clusters y componentes principales
    assert len(data["results"]) > 0
    assert "cluster" in data["results"][0]
    assert "PC1" in data["results"][0]
    assert "PC2" in data["results"][0]
    assert "ET DEA" in data["results"][0]  # Eficiencia técnica DEA por defecto

def test_pca_clustering_sfa_method(client: TestClient, test_db: Session):
    """Test con método SFA en lugar de DEA."""
    # Crear hospitales de prueba
    hospitales_test = [
        Hospital(
            hospital_id=201100, region_id=15, hospital_name="Hospital SFA Test 1",
            latitud=-18.4827, longitud=-70.3126, consultas=184208, grdxegresos=11953.83,
            bienesyservicios=19779704, remuneraciones=10982608, diascamadisponibles=113311,
            consultasurgencias=139557, examenes=898535, quirofanos=178, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=202100, region_id=1, hospital_name="Hospital SFA Test 2",
            latitud=-20.2139, longitud=-70.1383, consultas=149392, grdxegresos=13810.488,
            bienesyservicios=27881106, remuneraciones=15394204, diascamadisponibles=161383,
            consultasurgencias=104376, examenes=756183, quirofanos=9, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=203100, region_id=2, hospital_name="Hospital SFA Test 3",
            latitud=-23.6597, longitud=-70.3959, consultas=154729, grdxegresos=15613.328,
            bienesyservicios=29969438, remuneraciones=15065061, diascamadisponibles=196717,
            consultasurgencias=55364, examenes=897022, quirofanos=12, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=204100, region_id=3, hospital_name="Hospital SFA Test 4",
            latitud=-27.3668, longitud=-70.3323, consultas=98500, grdxegresos=8200.5,
            bienesyservicios=15000000, remuneraciones=12000000, diascamadisponibles=95000,
            consultasurgencias=75000, examenes=520000, quirofanos=8, año=2014, complejidad=2
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca-clustering?method=SFA&k=2")  # Usar número fijo de clusters
    
    assert response.status_code == 200
    data = response.json()
    
    metrics = data["metrics"]
    assert metrics["method"] == "SFA"
    assert metrics["efficiency_col"] == "ET SFA"
    
    # Verificar que los resultados incluyen eficiencia SFA
    assert "ET SFA" in data["results"][0]

def test_pca_clustering_custom_parameters(client: TestClient, test_db: Session):
    """Test con parámetros personalizados."""
    # Crear hospitales de prueba
    hospitales_test = [
        Hospital(
            hospital_id=301100, region_id=15, hospital_name="Hospital Custom Test 1",
            latitud=-18.4827, longitud=-70.3126, consultas=184208, grdxegresos=11953.83,
            bienesyservicios=19779704, remuneraciones=10982608, diascamadisponibles=113311,
            consultasurgencias=139557, examenes=898535, quirofanos=178, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=302100, region_id=1, hospital_name="Hospital Custom Test 2",
            latitud=-20.2139, longitud=-70.1383, consultas=149392, grdxegresos=13810.488,
            bienesyservicios=27881106, remuneraciones=15394204, diascamadisponibles=161383,
            consultasurgencias=104376, examenes=756183, quirofanos=9, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=303100, region_id=2, hospital_name="Hospital Custom Test 3",
            latitud=-23.6597, longitud=-70.3959, consultas=154729, grdxegresos=15613.328,
            bienesyservicios=29969438, remuneraciones=15065061, diascamadisponibles=196717,
            consultasurgencias=55364, examenes=897022, quirofanos=12, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=304100, region_id=3, hospital_name="Hospital Custom Test 4",
            latitud=-27.3668, longitud=-70.3323, consultas=98500, grdxegresos=8200.5,
            bienesyservicios=15000000, remuneraciones=12000000, diascamadisponibles=95000,
            consultasurgencias=75000, examenes=520000, quirofanos=8, año=2014, complejidad=2
        ),
        Hospital(
            hospital_id=305100, region_id=4, hospital_name="Hospital Custom Test 5",
            latitud=-29.9058, longitud=-71.2501, consultas=125000, grdxegresos=9500.2,
            bienesyservicios=18500000, remuneraciones=13500000, diascamadisponibles=110000,
            consultasurgencias=89000, examenes=620000, quirofanos=10, año=2014, complejidad=2
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca-clustering?k=3&n_components=3&scale=false&input_cols=consultas,remuneraciones&output_cols=grdxegresos")
    
    assert response.status_code == 200
    data = response.json()
    
    metrics = data["metrics"]
    assert metrics["k_clusters"] == 3
    assert metrics["n_components"] == 3
    assert metrics["scale_applied"] == False
    assert len(metrics["input_cols"]) == 2
    assert len(metrics["output_cols"]) == 1
    
    # Verificar que tenemos PC3
    assert "PC3" in data["results"][0]

def test_pca_clustering_invalid_year(client: TestClient, test_db: Session):
    """Test con año inexistente."""
    response = client.get("/pca-clustering?year=9999")
    
    assert response.status_code == 404
    assert "No se encontraron hospitales" in response.json()["detail"]

def test_pca_clustering_insufficient_hospitals(client: TestClient, test_db: Session):
    """Test con muy pocos hospitales para clustering."""
    # Crear solo un hospital
    hospital_test = Hospital(
        hospital_id=401100, region_id=15, hospital_name="Hospital Solo",
        latitud=-18.4827, longitud=-70.3126, consultas=184208, grdxegresos=11953.83,
        bienesyservicios=19779704, remuneraciones=10982608, diascamadisponibles=113311,
        consultasurgencias=139557, examenes=898535, quirofanos=178, año=2014, complejidad=3
    )
    
    test_db.add(hospital_test)
    test_db.commit()
    
    response = client.get("/pca-clustering")
    
    assert response.status_code == 400
    assert "Se necesitan al menos 2 hospitales" in response.json()["detail"]

def test_pca_clustering_invalid_columns(client: TestClient, test_db: Session):
    """Test con columnas inexistentes."""
    # Crear hospitales de prueba
    hospitales_test = [
        Hospital(
            hospital_id=501100, region_id=15, hospital_name="Hospital Cols Test 1",
            latitud=-18.4827, longitud=-70.3126, consultas=184208, grdxegresos=11953.83,
            bienesyservicios=19779704, remuneraciones=10982608, diascamadisponibles=113311,
            consultasurgencias=139557, examenes=898535, quirofanos=178, año=2014, complejidad=3
        ),
        Hospital(
            hospital_id=502100, region_id=1, hospital_name="Hospital Cols Test 2",
            latitud=-20.2139, longitud=-70.1383, consultas=149392, grdxegresos=13810.488,
            bienesyservicios=27881106, remuneraciones=15394204, diascamadisponibles=161383,
            consultasurgencias=104376, examenes=756183, quirofanos=9, año=2014, complejidad=3
        )
    ]
    
    # Agregar hospitales a la base de datos de prueba
    for hospital in hospitales_test:
        test_db.add(hospital)
    test_db.commit()
    
    response = client.get("/pca-clustering?input_cols=columna_falsa,otra_falsa")
    
    assert response.status_code == 400
    assert "Columnas de entrada no encontradas" in response.json()["detail"]

def test_pca_clustering_validation_errors(client: TestClient, test_db: Session):
    """Test de validación de parámetros."""
    # k fuera de rango
    response = client.get("/pca-clustering?k=1")
    assert response.status_code == 422
    
    response = client.get("/pca-clustering?k=25")
    assert response.status_code == 422
    
    # n_components fuera de rango
    response = client.get("/pca-clustering?n_components=0")
    assert response.status_code == 422
    
    response = client.get("/pca-clustering?n_components=15")
    assert response.status_code == 422
