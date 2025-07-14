"""
Tests para el endpoint /determinantes-efficiency - Análisis de determinantes de eficiencia.

El endpoint determinantes-efficiency analiza qué factores influyen en la eficiencia 
hospitalaria mediante regresión econométrica, identificando variables explicativas 
significativas para la eficiencia técnica.

Tests que cubren:
- Funcionamiento básico con DEA y SFA
- Validaciones de parámetros y variables
- Manejo de errores (variables faltantes, métodos inválidos)
- Parámetros personalizados de análisis
"""

import pytest
from fastapi.testclient import TestClient
from database.models import Hospital
from sqlalchemy.orm import Session


class TestDeterminantesEndpoint:
    """Tests para el endpoint /determinantes-efficiency"""

    def test_determinantes_dea_success_basic(self, client: TestClient, test_db: Session):
        """
        Test básico del endpoint determinantes con método DEA.
        
        Verifica:
        - Cálculo exitoso de determinantes de eficiencia
        - Estructura correcta de la respuesta
        - Presencia de coeficientes de regresión
        - Métricas estadísticas válidas
        """
        # Crear hospitales con diferentes características para análisis de determinantes
        hospitales_test = [
            Hospital(
                hospital_id=101100,
                region_id=15,
                hospital_name="Hospital Dr. Juan Noé Crevanni (Arica)",
                hospital_alternative_name="Hospital Doctor Juan Noé",
                latitud=-18.4827,
                longitud=-70.3126,
                consultas=184208,
                grdxegresos=11953.83,
                bienesyservicios=19779704,
                remuneraciones=10982608,
                diascamadisponibles=113311,
                consultasurgencias=139557,
                examenes=898535,
                quirofanos=178,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=102100,
                region_id=1,
                hospital_name="Hospital Dr. Ernesto Torres Galdames (Iquique)",
                hospital_alternative_name="Hospital Iquique",
                latitud=-20.2139,
                longitud=-70.1383,
                consultas=149392,
                grdxegresos=13810.488,
                bienesyservicios=27881106,
                remuneraciones=15394204,
                diascamadisponibles=161383,
                consultasurgencias=104376,
                examenes=756183,
                quirofanos=9,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=103100,
                region_id=2,
                hospital_name="Hospital Dr. Leonardo Guzmán (Antofagasta)",
                hospital_alternative_name="Hospital de Antofagasta",
                latitud=-23.6597,
                longitud=-70.3959,
                consultas=154729,
                grdxegresos=15613.328,
                bienesyservicios=29969438,
                remuneraciones=15065061,
                diascamadisponibles=196717,
                consultasurgencias=55364,
                examenes=897022,
                quirofanos=12,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=105100,
                region_id=3,
                hospital_name="Hospital Regional de Copiapó",
                hospital_alternative_name="Hospital Copiapó",
                latitud=-27.3668,
                longitud=-70.3323,
                consultas=98500,
                grdxegresos=8200.5,
                bienesyservicios=15000000,
                remuneraciones=12000000,
                diascamadisponibles=95000,
                consultasurgencias=75000,
                examenes=520000,
                quirofanos=8,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=106100,
                region_id=4,
                hospital_name="Hospital San Juan de Dios La Serena",
                hospital_alternative_name="Hospital La Serena",
                latitud=-29.9058,
                longitud=-71.2501,
                consultas=125000,
                grdxegresos=9500.2,
                bienesyservicios=18500000,
                remuneraciones=13500000,
                diascamadisponibles=110000,
                consultasurgencias=89000,
                examenes=620000,
                quirofanos=10,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=107100,
                region_id=5,
                hospital_name="Hospital Dr. Gustavo Fricke (Viña del Mar)",
                hospital_alternative_name="Hospital Gustavo Fricke",
                latitud=-33.0175,
                longitud=-71.5503,
                consultas=220000,
                grdxegresos=18500.8,
                bienesyservicios=35000000,
                remuneraciones=25000000,
                diascamadisponibles=180000,
                consultasurgencias=165000,
                examenes=1200000,
                quirofanos=15,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=108100,
                region_id=6,
                hospital_name="Hospital Regional de Rancagua",
                hospital_alternative_name="Hospital Rancagua",
                latitud=-34.1708,
                longitud=-70.7394,
                consultas=180000,
                grdxegresos=14200.3,
                bienesyservicios=28000000,
                remuneraciones=20000000,
                diascamadisponibles=150000,
                consultasurgencias=135000,
                examenes=950000,
                quirofanos=12,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=109100,
                region_id=7,
                hospital_name="Hospital Regional de Talca",
                hospital_alternative_name="Hospital Talca",
                latitud=-35.4264,
                longitud=-71.6554,
                consultas=165000,
                grdxegresos=12800.7,
                bienesyservicios=25000000,
                remuneraciones=18000000,
                diascamadisponibles=140000,
                consultasurgencias=120000,
                examenes=850000,
                quirofanos=11,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=110100,
                region_id=8,
                hospital_name="Hospital Las Higueras de Talcahuano",
                hospital_alternative_name="Hospital Las Higueras",
                latitud=-36.7167,
                longitud=-73.1167,
                consultas=140000,
                grdxegresos=11200.4,
                bienesyservicios=22000000,
                remuneraciones=16000000,
                diascamadisponibles=125000,
                consultasurgencias=105000,
                examenes=720000,
                quirofanos=9,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=111100,
                region_id=9,
                hospital_name="Hospital Dr. Hernán Henríquez Aravena (Temuco)",
                hospital_alternative_name="Hospital Hernán Henríquez",
                latitud=-38.7352,
                longitud=-72.5906,
                consultas=195000,
                grdxegresos=16800.9,
                bienesyservicios=32000000,
                remuneraciones=23000000,
                diascamadisponibles=170000,
                consultasurgencias=150000,
                examenes=1100000,
                quirofanos=14,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=112100,
                region_id=10,
                hospital_name="Hospital Base de Valdivia",
                hospital_alternative_name="Hospital Valdivia",
                latitud=-39.8142,
                longitud=-73.2459,
                consultas=175000,
                grdxegresos=14500.6,
                bienesyservicios=28500000,
                remuneraciones=21000000,
                diascamadisponibles=155000,
                consultasurgencias=135000,
                examenes=980000,
                quirofanos=13,
                año=2014,
                complejidad=2
            )
        ]

        # Agregar hospitales a la base de datos
        for hospital in hospitales_test:
            test_db.add(hospital)
        test_db.commit()

        # Realizar petición al endpoint
        response = client.get("/determinantes-efficiency", params={
            "efficiency_method": "DEA",
            "independent_vars": "complejidad,region_id",
            "input_cols": "bienesyservicios,remuneraciones",
            "output_cols": "consultas",
            "year": 2014,
            "top_n": 3
        })

        # Verificar respuesta exitosa
        assert response.status_code == 200
        data = response.json()

        # Verificar estructura de la respuesta
        required_fields = [
            "variable_dependiente", "variables_independientes", "metodo_eficiencia",
            "coeficientes", "variables_clave", "r_cuadrado", "r_cuadrado_ajustado",
            "observaciones", "mensaje", "input_cols", "output_cols"
        ]
        for field in required_fields:
            assert field in data, f"Campo requerido {field} no encontrado en la respuesta"

        # Verificar método y variables
        assert data["metodo_eficiencia"] == "DEA"
        assert data["variables_independientes"] == ["complejidad", "region_id"]
        assert data["input_cols"] == ["bienesyservicios", "remuneraciones"]
        assert data["output_cols"] == ["consultas"]
        assert "ET DEA" in data["variable_dependiente"]

        # Verificar coeficientes
        assert isinstance(data["coeficientes"], list)
        assert len(data["coeficientes"]) >= 2  # Al menos constante + variables independientes
        
        for coef in data["coeficientes"]:
            required_coef_fields = ["variable", "coeficiente", "error_estandar", "t_value", "p_value", "significativo"]
            for field in required_coef_fields:
                assert field in coef, f"Campo {field} no encontrado en coeficiente"
            assert isinstance(coef["significativo"], bool)

        # Verificar métricas estadísticas
        assert isinstance(data["r_cuadrado"], float)
        assert 0 <= data["r_cuadrado"] <= 1
        assert isinstance(data["r_cuadrado_ajustado"], float)
        assert isinstance(data["observaciones"], int)
        assert data["observaciones"] > 0

        # Verificar variables clave
        assert isinstance(data["variables_clave"], list)
        assert len(data["variables_clave"]) <= 3  # top_n = 3

        print(f"✓ Test DEA exitoso - R² = {data['r_cuadrado']:.3f}, observaciones = {data['observaciones']}")

    def test_determinantes_sfa_success_basic(self, client: TestClient, test_db: Session):
        """
        Test básico del endpoint determinantes con método SFA.
        
        Verifica:
        - Cálculo exitoso con método SFA
        - Estructura correcta de la respuesta
        - Variables independientes procesadas correctamente
        """
        # Crear hospitales para testing (reutilizamos algunos del test anterior)
        hospitales_test = [
            Hospital(
                hospital_id=201100,
                region_id=1,
                hospital_name="Hospital SFA Test 1",
                hospital_alternative_name="SFA Test 1",
                latitud=-20.2139,
                longitud=-70.1383,
                consultas=150000,
                grdxegresos=12000.0,
                bienesyservicios=25000000,
                remuneraciones=18000000,
                diascamadisponibles=140000,
                consultasurgencias=110000,
                examenes=800000,
                quirofanos=10,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=202100,
                region_id=2,
                hospital_name="Hospital SFA Test 2",
                hospital_alternative_name="SFA Test 2",
                latitud=-23.6597,
                longitud=-70.3959,
                consultas=120000,
                grdxegresos=10500.0,
                bienesyservicios=20000000,
                remuneraciones=15000000,
                diascamadisponibles=120000,
                consultasurgencias=95000,
                examenes=650000,
                quirofanos=8,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=203100,
                region_id=3,
                hospital_name="Hospital SFA Test 3",
                hospital_alternative_name="SFA Test 3",
                latitud=-27.3668,
                longitud=-70.3323,
                consultas=95000,
                grdxegresos=8500.0,
                bienesyservicios=16000000,
                remuneraciones=12000000,
                diascamadisponibles=100000,
                consultasurgencias=75000,
                examenes=480000,
                quirofanos=6,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=204100,
                region_id=4,
                hospital_name="Hospital SFA Test 4",
                hospital_alternative_name="SFA Test 4",
                latitud=-29.9058,
                longitud=-71.2501,
                consultas=180000,
                grdxegresos=15500.0,
                bienesyservicios=30000000,
                remuneraciones=22000000,
                diascamadisponibles=160000,
                consultasurgencias=140000,
                examenes=1000000,
                quirofanos=12,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=205100,
                region_id=5,
                hospital_name="Hospital SFA Test 5",
                hospital_alternative_name="SFA Test 5",
                latitud=-33.0175,
                longitud=-71.5503,
                consultas=75000,
                grdxegresos=6800.0,
                bienesyservicios=12000000,
                remuneraciones=9000000,
                diascamadisponibles=80000,
                consultasurgencias=60000,
                examenes=350000,
                quirofanos=4,
                año=2014,
                complejidad=1
            ),
            Hospital(
                hospital_id=206100,
                region_id=6,
                hospital_name="Hospital SFA Test 6",
                hospital_alternative_name="SFA Test 6",
                latitud=-34.1708,
                longitud=-70.7394,
                consultas=65000,
                grdxegresos=5900.0,
                bienesyservicios=10000000,
                remuneraciones=7500000,
                diascamadisponibles=70000,
                consultasurgencias=50000,
                examenes=290000,
                quirofanos=3,
                año=2014,
                complejidad=1
            )
        ]

        # Agregar hospitales a la base de datos
        for hospital in hospitales_test:
            test_db.add(hospital)
        test_db.commit()

        # Realizar petición al endpoint con SFA
        response = client.get("/determinantes-efficiency", params={
            "efficiency_method": "SFA",
            "independent_vars": "complejidad,quirofanos",
            "input_cols": "bienesyservicios,remuneraciones,diascamadisponibles",
            "output_cols": "consultas",  # SFA usa solo el primer output
            "year": 2014,
            "top_n": 2
        })

        # Verificar respuesta exitosa
        assert response.status_code == 200
        data = response.json()

        # Verificar método SFA
        assert data["metodo_eficiencia"] == "SFA"
        assert data["variables_independientes"] == ["complejidad", "quirofanos"]
        assert "ET SFA" in data["variable_dependiente"]

        # Verificar que tenemos suficientes observaciones
        assert data["observaciones"] >= 5

        # Verificar que los coeficientes incluyen nuestras variables independientes
        coef_vars = [coef["variable"] for coef in data["coeficientes"]]
        assert "complejidad" in coef_vars
        assert "quirofanos" in coef_vars

        print(f"✓ Test SFA exitoso - R² = {data['r_cuadrado']:.3f}, observaciones = {data['observaciones']}")

    def test_determinantes_multiple_variables(self, client: TestClient, test_db: Session):
        """
        Test con múltiples variables independientes.
        
        Verifica:
        - Procesamiento de múltiples variables independientes
        - Múltiples outputs para DEA
        - Inclusión de todas las variables en coeficientes
        """
        # Crear hospitales para testing con más variabilidad
        hospitales_test = [
            Hospital(
                hospital_id=301100,
                region_id=1,
                hospital_name="Hospital Multi Test 1",
                hospital_alternative_name="Multi Test 1",
                latitud=-18.4827,
                longitud=-70.3126,
                consultas=200000,
                grdxegresos=18000.0,
                bienesyservicios=35000000,
                remuneraciones=25000000,
                diascamadisponibles=180000,
                consultasurgencias=160000,
                examenes=1200000,
                quirofanos=15,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=302100,
                region_id=5,
                hospital_name="Hospital Multi Test 2",
                hospital_alternative_name="Multi Test 2",
                latitud=-33.0175,
                longitud=-71.5503,
                consultas=160000,
                grdxegresos=14000.0,
                bienesyservicios=28000000,
                remuneraciones=20000000,
                diascamadisponibles=150000,
                consultasurgencias=130000,
                examenes=950000,
                quirofanos=12,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=303100,
                region_id=8,
                hospital_name="Hospital Multi Test 3",
                hospital_alternative_name="Multi Test 3",
                latitud=-36.7167,
                longitud=-73.1167,
                consultas=120000,
                grdxegresos=10000.0,
                bienesyservicios=22000000,
                remuneraciones=16000000,
                diascamadisponibles=120000,
                consultasurgencias=100000,
                examenes=700000,
                quirofanos=9,
                año=2014,
                complejidad=2
            ),
            Hospital(
                hospital_id=304100,
                region_id=10,
                hospital_name="Hospital Multi Test 4",
                hospital_alternative_name="Multi Test 4",
                latitud=-39.8142,
                longitud=-73.2459,
                consultas=80000,
                grdxegresos=7000.0,
                bienesyservicios=15000000,
                remuneraciones=11000000,
                diascamadisponibles=90000,
                consultasurgencias=70000,
                examenes=450000,
                quirofanos=6,
                año=2014,
                complejidad=1
            ),
            Hospital(
                hospital_id=305100,
                region_id=12,
                hospital_name="Hospital Multi Test 5",
                hospital_alternative_name="Multi Test 5",
                latitud=-53.1638,
                longitud=-70.9171,
                consultas=60000,
                grdxegresos=5000.0,
                bienesyservicios=10000000,
                remuneraciones=7500000,
                diascamadisponibles=65000,
                consultasurgencias=45000,
                examenes=280000,
                quirofanos=4,
                año=2014,
                complejidad=1
            )
        ]

        # Agregar hospitales a la base de datos
        for hospital in hospitales_test:
            test_db.add(hospital)
        test_db.commit()

        # Realizar petición con múltiples variables
        response = client.get("/determinantes-efficiency", params={
            "efficiency_method": "DEA",
            "independent_vars": "complejidad,region_id,quirofanos,diascamadisponibles",
            "input_cols": "bienesyservicios,remuneraciones",
            "output_cols": "consultas,grdxegresos",
            "year": 2014,
            "top_n": 5
        })

        # Verificar respuesta exitosa
        assert response.status_code == 200
        data = response.json()

        # Verificar todas las variables están incluidas
        expected_vars = ["complejidad", "region_id", "quirofanos", "diascamadisponibles"]
        assert data["variables_independientes"] == expected_vars

        # Verificar coeficientes incluyen todas las variables (más constante)
        coef_vars = [coef["variable"] for coef in data["coeficientes"]]
        for var in expected_vars:
            assert var in coef_vars

        # Verificar que hay término constante
        assert "const" in coef_vars or "Intercept" in coef_vars

        # Verificar múltiples outputs para DEA
        assert len(data["output_cols"]) == 2
        assert "consultas" in data["output_cols"]
        assert "grdxegresos" in data["output_cols"]

        print(f"✓ Test múltiples variables exitoso - {len(expected_vars)} variables independientes")

    def test_determinantes_missing_variables_error(self, client: TestClient, test_db: Session):
        """
        Test de error cuando se especifican variables independientes que no existen.
        
        Verifica:
        - Error 400 cuando variable independiente no existe
        - Mensaje de error descriptivo
        """
        # Crear un hospital básico para testing
        hospital = Hospital(
            hospital_id=401100,
            region_id=1,
            hospital_name="Hospital Error Test",
            hospital_alternative_name="Error Test",
            latitud=-18.4827,
            longitud=-70.3126,
            consultas=100000,
            grdxegresos=8000.0,
            bienesyservicios=15000000,
            remuneraciones=12000000,
            diascamadisponibles=100000,
            consultasurgencias=80000,
            examenes=500000,
            quirofanos=8,
            año=2014,
            complejidad=2
        )
        test_db.add(hospital)
        test_db.commit()

        # Petición con variable independiente inexistente
        response = client.get("/determinantes-efficiency", params={
            "efficiency_method": "DEA",
            "independent_vars": "complejidad,variable_inexistente",
            "input_cols": "bienesyservicios,remuneraciones",
            "output_cols": "consultas",
            "year": 2014
        })

        # Verificar error 400
        assert response.status_code == 400
        error_detail = response.json()["detail"]
        assert "Variables independientes no encontradas" in error_detail
        assert "variable_inexistente" in error_detail

        print("✓ Test error variables independientes exitoso")

    def test_determinantes_missing_inputs_error(self, client: TestClient, test_db: Session):
        """
        Test de error cuando se especifican columnas de input que no existen.
        """
        # Crear un hospital básico
        hospital = Hospital(
            hospital_id=501100,
            region_id=1,
            hospital_name="Hospital Input Error Test",
            hospital_alternative_name="Input Error Test",
            latitud=-18.4827,
            longitud=-70.3126,
            consultas=100000,
            grdxegresos=8000.0,
            bienesyservicios=15000000,
            remuneraciones=12000000,
            diascamadisponibles=100000,
            consultasurgencias=80000,
            examenes=500000,
            quirofanos=8,
            año=2014,
            complejidad=2
        )
        test_db.add(hospital)
        test_db.commit()

        # Petición con input inexistente
        response = client.get("/determinantes-efficiency", params={
            "efficiency_method": "DEA",
            "independent_vars": "complejidad,region_id",
            "input_cols": "input_inexistente,remuneraciones",
            "output_cols": "consultas",
            "year": 2014
        })

        # Verificar error 400
        assert response.status_code == 400
        error_detail = response.json()["detail"]
        assert "Columnas de input no encontradas" in error_detail
        assert "input_inexistente" in error_detail

        print("✓ Test error inputs inexistentes exitoso")

    def test_determinantes_no_hospitals_found(self, client: TestClient, test_db: Session):
        """
        Test cuando no se encuentran hospitales para el año especificado.
        """
        # No agregamos hospitales para el año que vamos a consultar

        response = client.get("/determinantes-efficiency", params={
            "efficiency_method": "DEA",
            "independent_vars": "complejidad,region_id",
            "input_cols": "bienesyservicios,remuneraciones",
            "output_cols": "consultas",
            "year": 2050  # Año que no existe
        })

        # Verificar error 404
        assert response.status_code == 404
        error_detail = response.json()["detail"]
        assert "No se encontraron hospitales" in error_detail

        print("✓ Test sin hospitales encontrados exitoso")

    def test_determinantes_invalid_method_error(self, client: TestClient, test_db: Session):
        """
        Test con método de eficiencia inválido.
        """
        # Crear un hospital básico
        hospital = Hospital(
            hospital_id=601100,
            region_id=1,
            hospital_name="Hospital Method Error Test",
            hospital_alternative_name="Method Error Test",
            latitud=-18.4827,
            longitud=-70.3126,
            consultas=100000,
            grdxegresos=8000.0,
            bienesyservicios=15000000,
            remuneraciones=12000000,
            diascamadisponibles=100000,
            consultasurgencias=80000,
            examenes=500000,
            quirofanos=8,
            año=2014,
            complejidad=2
        )
        test_db.add(hospital)
        test_db.commit()

        # Petición con método inválido
        response = client.get("/determinantes-efficiency", params={
            "efficiency_method": "METODO_INVALIDO",
            "independent_vars": "complejidad",
            "input_cols": "bienesyservicios",
            "output_cols": "consultas",
            "year": 2014
        })

        # Verificar error 500 (error interno por método inválido)
        assert response.status_code == 500

        print("✓ Test método inválido exitoso")

    def test_determinantes_parameter_defaults(self, client: TestClient, test_db: Session):
        """
        Test de parámetros por defecto.
        
        Verifica:
        - Valores por defecto aplicados correctamente
        - Funcionamiento sin especificar todos los parámetros opcionales
        """
        # Crear hospitales para testing
        hospitales_test = [
            Hospital(
                hospital_id=701100,
                region_id=1,
                hospital_name="Hospital Default Test 1",
                hospital_alternative_name="Default Test 1",
                latitud=-18.4827,
                longitud=-70.3126,
                consultas=150000,
                grdxegresos=12000.0,
                bienesyservicios=25000000,
                remuneraciones=18000000,
                diascamadisponibles=140000,
                consultasurgencias=110000,
                examenes=800000,
                quirofanos=10,
                año=2014,
                complejidad=3
            ),
            Hospital(
                hospital_id=702100,
                region_id=2,
                hospital_name="Hospital Default Test 2",
                hospital_alternative_name="Default Test 2",
                latitud=-23.6597,
                longitud=-70.3959,
                consultas=100000,
                grdxegresos=8000.0,
                bienesyservicios=18000000,
                remuneraciones=13000000,
                diascamadisponibles=110000,
                consultasurgencias=85000,
                examenes=600000,
                quirofanos=7,
                año=2014,
                complejidad=2
            )
        ]

        for hospital in hospitales_test:
            test_db.add(hospital)
        test_db.commit()

        # Petición usando valores por defecto (efficiency_method="DEA", top_n=5)
        response = client.get("/determinantes-efficiency", params={
            "independent_vars": "complejidad,region_id",
            "input_cols": "bienesyservicios,remuneraciones",
            "output_cols": "consultas",
            "year": 2014
        })

        # Verificar respuesta exitosa
        assert response.status_code == 200
        data = response.json()

        # Verificar valores por defecto
        assert data["metodo_eficiencia"] == "DEA"  # Valor por defecto
        assert len(data["variables_clave"]) <= 5  # top_n por defecto = 5

        print("✓ Test parámetros por defecto exitoso")

if __name__ == "__main__":
    pytest.main([__file__])
