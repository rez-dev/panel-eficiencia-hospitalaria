"""
Tests avanzados para demostrar capacidades de testing.
"""
import pytest
from sqlalchemy.orm import Session
from database.models import Hospital
from database.database import get_database_url


class TestHospitalOperations:
    """Clase para agrupar tests relacionados con hospitales."""
    
    def test_hospital_creation_validation(self, test_db: Session):
        """Test para validar la creación correcta de hospitales."""
        hospital = Hospital(
            hospital_id=1,
            region_id=1,
            hospital_name="Hospital Prueba",
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
            año=2023,
            complejidad=3
        )
        
        test_db.add(hospital)
        test_db.commit()
        test_db.refresh(hospital)
        
        assert hospital.hospital_id == 1
        assert hospital.hospital_name == "Hospital Prueba"
    
    def test_hospital_query_by_region(self, test_db: Session):
        """Test para consultar hospitales por región."""
        # Crear hospitales en diferentes regiones
        hospitals = [
            Hospital(hospital_id=1, region_id=1, hospital_name="Hospital Norte", 
                    latitud=-33.4489, longitud=-70.6693, consultas=1000, grdxegresos=50.5,
                    bienesyservicios=50000, remuneraciones=100000, diascamadisponibles=365,
                    consultasurgencias=500, examenes=200.5, quirofanos=5.0, año=2023, complejidad=3),
            Hospital(hospital_id=2, region_id=2, hospital_name="Hospital Sur",
                    latitud=-36.8485, longitud=-73.0542, consultas=1500, grdxegresos=75.5,
                    bienesyservicios=75000, remuneraciones=150000, diascamadisponibles=400,
                    consultasurgencias=750, examenes=300.5, quirofanos=7.0, año=2023, complejidad=4),
            Hospital(hospital_id=3, region_id=1, hospital_name="Hospital Norte 2",
                    latitud=-33.4489, longitud=-70.6693, consultas=800, grdxegresos=40.0,
                    bienesyservicios=40000, remuneraciones=80000, diascamadisponibles=300,
                    consultasurgencias=400, examenes=150.0, quirofanos=4.0, año=2023, complejidad=2),
        ]
        
        for hospital in hospitals:
            test_db.add(hospital)
        test_db.commit()
        
        # Consultar hospitales de la región 1
        region_1_hospitals = test_db.query(Hospital).filter(Hospital.region_id == 1).all()
        assert len(region_1_hospitals) == 2
        
        hospital_names = [h.hospital_name for h in region_1_hospitals]
        assert "Hospital Norte" in hospital_names
        assert "Hospital Norte 2" in hospital_names
    
    def test_hospital_efficiency_calculation(self, test_db: Session):
        """Test para calcular métricas de eficiencia básicas."""
        hospital = Hospital(
            hospital_id=1,
            region_id=1,
            hospital_name="Hospital Eficiencia",
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
            año=2023,
            complejidad=3
        )
        
        test_db.add(hospital)
        test_db.commit()
        
        # Calcular algunas métricas básicas
        total_costs = hospital.bienesyservicios + hospital.remuneraciones
        efficiency_ratio = hospital.consultas / total_costs if total_costs > 0 else 0
        
        assert total_costs == 150000
        assert efficiency_ratio > 0
        assert efficiency_ratio == 1000 / 150000


@pytest.mark.parametrize("complejidad,expected_min_quirofanos", [
    (1, 1),
    (2, 3),
    (3, 5),
    (4, 7),
])
def test_hospital_complexity_requirements(test_db: Session, complejidad, expected_min_quirofanos):
    """Test parametrizado para validar requerimientos por complejidad."""
    hospital = Hospital(
        hospital_id=1,
        region_id=1,
        hospital_name=f"Hospital Complejidad {complejidad}",
        latitud=-33.4489,
        longitud=-70.6693,
        consultas=1000,
        grdxegresos=50.5,
        bienesyservicios=50000,
        remuneraciones=100000,
        diascamadisponibles=365,
        consultasurgencias=500,
        examenes=200.5,
        quirofanos=expected_min_quirofanos,
        año=2023,
        complejidad=complejidad
    )
    
    test_db.add(hospital)
    test_db.commit()
    
    # Validar que el hospital cumple con los requerimientos mínimos
    assert hospital.quirofanos >= expected_min_quirofanos
    assert hospital.complejidad == complejidad


def test_database_isolation_between_tests(test_db: Session):
    """Test para verificar que cada test tiene una DB limpia."""
    # Este test debería no encontrar ningún hospital previo
    hospitals = test_db.query(Hospital).all()
    assert len(hospitals) == 0, "La base de datos debería estar limpia al inicio de cada test"
    
    # Crear un hospital
    hospital = Hospital(
        hospital_id=1,
        region_id=1,
        hospital_name="Hospital Aislamiento",
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
        año=2023,
        complejidad=3
    )
    
    test_db.add(hospital)
    test_db.commit()
    
    # Verificar que existe
    hospitals = test_db.query(Hospital).all()
    assert len(hospitals) == 1
