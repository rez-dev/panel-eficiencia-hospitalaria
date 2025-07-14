"""
Tests para la función calculate_dea_malmquist_fast.

El índice de Malmquist mide el cambio de productividad entre dos períodos,
descomponiéndolo en:
- EFFCH: Cambio en eficiencia técnica
- TECH: Cambio tecnológico  
- Malmquist: Cambio total de productividad
- %ΔProd: Porcentaje de cambio en productividad

Tests que cubren:
- Cálculo básico con dos períodos
- Diferentes parámetros (RTS, orientación)
- Filtros top-N
- Casos extremos y manejo de errores
"""

import pytest
import pandas as pd
import numpy as np
from utils.functions import calculate_dea_malmquist_fast


class TestMalmquistCalculations:
    """Tests para cálculos del índice de Malmquist"""

    def test_malmquist_basic_calculation(self):
        """
        Test básico del cálculo del índice de Malmquist.
        
        Verifica:
        - Cálculo correcto con datos válidos de dos períodos
        - Estructura correcta del DataFrame resultante  
        - Métricas esperadas en el resumen
        - Valores dentro de rangos esperados
        """
        # Datos de hospitales para período t (2014)
        df_t = pd.DataFrame({
            'hospital_id': [101100, 102100, 103100],
            'bienesyservicios': [19779704, 27881106, 29969438],
            'remuneraciones': [10982608, 15394204, 15065061],
            'diascamadisponibles': [113311, 161383, 196717],
            'consultas': [184208, 149392, 154729]
        })
        
        # Datos de hospitales para período t+1 (2015) - con cambios en productividad
        df_t1 = pd.DataFrame({
            'hospital_id': [101100, 102100, 103100],
            'bienesyservicios': [20000000, 28000000, 30000000],
            'remuneraciones': [11000000, 16000000, 15500000],
            'diascamadisponibles': [115000, 165000, 200000],
            'consultas': [190000, 155000, 160000]  # Aumento en outputs
        })
        
        # Definir inputs y outputs
        input_cols = ['bienesyservicios', 'remuneraciones', 'diascamadisponibles']
        output_cols = ['consultas']
        
        # Calcular índice de Malmquist
        df_result, summary = calculate_dea_malmquist_fast(
            df_t, df_t1, input_cols, output_cols
        )
        
        # Verificar estructura del DataFrame resultado
        assert isinstance(df_result, pd.DataFrame)
        assert len(df_result) == 3
        
        # Verificar columnas esperadas
        expected_columns = ['EFF_t', 'EFF_t1', 'EFFCH', 'TECH', 'Malmquist', '%ΔProd']
        for col in expected_columns:
            assert col in df_result.columns
        
        # Verificar que los índices son los hospital_id
        assert list(df_result.index) == [101100, 102100, 103100]
        
        # Verificar tipos de datos
        for col in expected_columns:
            assert df_result[col].dtype in [np.float64, float]
        
        # Verificar rangos de eficiencia 
        # En DEA con orientación input: EFF >= 1 (1 = eficiente, >1 = ineficiente)
        # En DEA con orientación output: 0 <= EFF <= 1 (1 = eficiente, <1 = ineficiente)
        assert (df_result['EFF_t'] >= 0).all()
        assert (df_result['EFF_t1'] >= 0).all()
        # No verificamos límite superior porque depende de la orientación
        
        # Verificar que EFFCH = EFF_t1 / EFF_t
        expected_effch = df_result['EFF_t1'] / df_result['EFF_t']
        np.testing.assert_array_almost_equal(df_result['EFFCH'], expected_effch, decimal=6)
        
        # Verificar que Malmquist = EFFCH * TECH
        expected_malmquist = df_result['EFFCH'] * df_result['TECH']
        np.testing.assert_array_almost_equal(df_result['Malmquist'], expected_malmquist, decimal=6)
        
        # Verificar que %ΔProd = (Malmquist - 1) * 100
        expected_pct_delta = (df_result['Malmquist'] - 1) * 100
        np.testing.assert_array_almost_equal(df_result['%ΔProd'], expected_pct_delta, decimal=6)
        
        # Verificar estructura del resumen
        assert isinstance(summary, dict)
        expected_summary_keys = ['EFFCH_mean', 'TECH_mean', 'Malmquist_mean', 
                                'pctΔProd_mean', 'n_hospitals']
        for key in expected_summary_keys:
            assert key in summary
        
        # Verificar que n_hospitals es correcto
        assert summary['n_hospitals'] == 3
        
        # Verificar que las medias son float
        for key in ['EFFCH_mean', 'TECH_mean', 'Malmquist_mean', 'pctΔProd_mean']:
            assert isinstance(summary[key], float)

    def test_malmquist_different_parameters(self):
        """
        Test del índice de Malmquist con diferentes parámetros.
        
        Verifica:
        - Funcionamiento con RTS diferentes (CRS vs VRS)
        - Orientación diferente (input vs output)
        - Uso de cross-efficiency
        """
        # Datos simplificados
        df_t = pd.DataFrame({
            'hospital_id': [1, 2, 3],
            'input1': [100, 120, 80],
            'input2': [200, 180, 160],
            'output1': [50, 60, 40]
        })
        
        df_t1 = pd.DataFrame({
            'hospital_id': [1, 2, 3],
            'input1': [95, 115, 85],
            'input2': [190, 175, 155],
            'output1': [55, 65, 45]
        })
        
        # Test con VRS y orientación output
        df_result_vrs, summary_vrs = calculate_dea_malmquist_fast(
            df_t, df_t1, 
            input_cols=['input1', 'input2'],
            output_cols=['output1'],
            rts="VRS",
            orientation="out"
        )
        
        # Verificar que funciona
        assert len(df_result_vrs) == 3
        assert summary_vrs['n_hospitals'] == 3
        
        # Test sin cross-efficiency
        df_result_no_cross, summary_no_cross = calculate_dea_malmquist_fast(
            df_t, df_t1,
            input_cols=['input1', 'input2'], 
            output_cols=['output1'],
            use_cross=False
        )
        
        # Sin cross-efficiency, TECH debería ser 1 para todos
        assert (df_result_no_cross['TECH'] == 1.0).all()
        assert summary_no_cross['TECH_mean'] == 1.0

    def test_malmquist_top_n_filter(self):
        """
        Test del filtro top-N en el cálculo de Malmquist.
        
        Verifica:
        - Filtro por top_input_col
        - Filtro por max_dmus
        - Filtro por top_ids
        """
        # Datos con más hospitales para probar filtros
        df_t = pd.DataFrame({
            'hospital_id': [1, 2, 3, 4, 5],
            'bienesyservicios': [100000, 200000, 150000, 300000, 80000],
            'remuneraciones': [50000, 100000, 75000, 150000, 40000],
            'consultas': [1000, 2000, 1500, 3000, 800]
        })
        
        df_t1 = pd.DataFrame({
            'hospital_id': [1, 2, 3, 4, 5],
            'bienesyservicios': [105000, 210000, 155000, 310000, 85000],
            'remuneraciones': [52000, 105000, 78000, 155000, 42000],
            'consultas': [1100, 2100, 1600, 3200, 900]
        })
        
        # Test con top_input_col (top 3 por bienesyservicios)
        df_result_top, summary_top = calculate_dea_malmquist_fast(
            df_t, df_t1,
            input_cols=['bienesyservicios', 'remuneraciones'],
            output_cols=['consultas'],
            top_input_col='bienesyservicios',
            top_n=3
        )
        
        # Debería incluir solo los 3 hospitales con mayor bienesyservicios
        assert len(df_result_top) == 3
        assert summary_top['n_hospitals'] == 3
        # Los IDs deberían ser 4, 2, 3 (ordenados por bienesyservicios descendente)
        expected_ids = [4, 2, 3]
        assert sorted(df_result_top.index.tolist()) == sorted(expected_ids)
        
        # Test con max_dmus
        df_result_max, summary_max = calculate_dea_malmquist_fast(
            df_t, df_t1,
            input_cols=['bienesyservicios', 'remuneraciones'],
            output_cols=['consultas'],
            max_dmus=2
        )
        
        assert len(df_result_max) == 2
        assert summary_max['n_hospitals'] == 2
        
        # Test con top_ids específicos
        df_result_ids, summary_ids = calculate_dea_malmquist_fast(
            df_t, df_t1,
            input_cols=['bienesyservicios', 'remuneraciones'],
            output_cols=['consultas'],
            top_ids=[1, 3, 5]
        )
        
        assert len(df_result_ids) == 3
        assert sorted(df_result_ids.index.tolist()) == [1, 3, 5]

    def test_malmquist_error_cases(self):
        """
        Test de casos de error en el cálculo de Malmquist.
        
        Verifica:
        - Error cuando no hay hospitales comunes
        - Error cuando no quedan hospitales tras filtros
        - Error con top_input_col inválido
        """
        # Datos sin hospitales comunes
        df_t = pd.DataFrame({
            'hospital_id': [1, 2, 3],
            'input1': [100, 120, 80],
            'output1': [50, 60, 40]
        })
        
        df_t1 = pd.DataFrame({
            'hospital_id': [4, 5, 6],  # IDs diferentes
            'input1': [95, 115, 85],
            'output1': [55, 65, 45]
        })
        
        # Debería lanzar error por no tener hospitales comunes
        with pytest.raises(ValueError, match="No hay hospitales comunes"):
            calculate_dea_malmquist_fast(
                df_t, df_t1,
                input_cols=['input1'],
                output_cols=['output1']
            )
        
        # Datos con hospitales comunes pero top_input_col inválido
        df_t1_fixed = pd.DataFrame({
            'hospital_id': [1, 2, 3],
            'input1': [95, 115, 85],
            'output1': [55, 65, 45]
        })
        
        with pytest.raises(ValueError, match="top_input_col debe ser uno de input_cols"):
            calculate_dea_malmquist_fast(
                df_t, df_t1_fixed,
                input_cols=['input1'],
                output_cols=['output1'],
                top_input_col='columna_inexistente'
            )
        
        # Test con filtro que elimina todos los hospitales
        with pytest.raises(ValueError, match="No quedan hospitales tras aplicar el filtro"):
            calculate_dea_malmquist_fast(
                df_t, df_t1_fixed,
                input_cols=['input1'],
                output_cols=['output1'],
                top_ids=[999]  # ID que no existe
            )

    def test_malmquist_with_zero_values(self):
        """
        Test del comportamiento con valores cero (que deberían ser filtrados).
        
        Verifica:
        - Filtrado automático de valores <= 0
        - Funcionamiento con subset válido
        """
        # Datos con algunos valores cero/negativos
        df_t = pd.DataFrame({
            'hospital_id': [1, 2, 3, 4],
            'input1': [100, 0, 150, 200],      # Hospital 2 tiene input = 0
            'input2': [50, 60, 75, 100],
            'output1': [30, 40, 0, 60]         # Hospital 3 tiene output = 0
        })
        
        df_t1 = pd.DataFrame({
            'hospital_id': [1, 2, 3, 4],
            'input1': [105, 50, 155, 210],     # Hospital 2 ahora válido
            'input2': [52, 62, 78, 105],
            'output1': [32, 42, 45, 65]        # Hospital 3 ahora válido
        })
        
        # Solo los hospitales con todos los valores > 0 en ambos períodos deberían incluirse
        df_result, summary = calculate_dea_malmquist_fast(
            df_t, df_t1,
            input_cols=['input1', 'input2'],
            output_cols=['output1']
        )
        
        # Solo hospitales 1 y 4 deberían estar (tienen valores > 0 en ambos períodos)
        assert len(df_result) == 2
        assert sorted(df_result.index.tolist()) == [1, 4]
        assert summary['n_hospitals'] == 2
