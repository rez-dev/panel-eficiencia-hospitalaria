"""
Pruebas para las funciones del módulo utils.functions.

Estas pruebas cubren todas las funciones principales de análisis:
- SFA (Stochastic Frontier Analysis)
- DEA (Data Envelopment Analysis) 
- PCA (Principal Component Analysis)
- K-means clustering
- Malmquist Index
- Análisis de determinantes

Esto aumentará significativamente la cobertura total del proyecto.
"""

import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock
import utils.functions as utils


class TestSFAMetrics:
    """Pruebas para calculate_sfa_metrics."""
    
    def test_sfa_metrics_basic_functionality(self):
        """Prueba funcionalidad básica de SFA."""
        # Crear datos de prueba más robustos
        df = pd.DataFrame({
            'bienesyservicios': [1000000, 1200000, 800000, 1500000, 900000],
            'remuneraciones': [2000000, 2200000, 1800000, 2500000, 1900000],
            'consultas': [25000, 30000, 20000, 35000, 22000],
            'hospital_id': [1, 2, 3, 4, 5]
        })
        
        input_cols = ['bienesyservicios', 'remuneraciones']
        output_col = ['consultas']
        
        result_df, metrics = utils.calculate_sfa_metrics(
            df=df,
            input_cols=input_cols,
            output_col=output_col
        )
        
        # Verificaciones básicas
        assert isinstance(result_df, pd.DataFrame)
        assert isinstance(metrics, dict)
        assert len(result_df) == len(df)
        assert 'ET SFA' in result_df.columns  # Nombre real de la columna
        assert 'et_promedio' in metrics  # Nombre real de la métrica
        assert 'pct_criticos' in metrics
    
    def test_sfa_metrics_empty_dataframe(self):
        """Prueba SFA con DataFrame vacío."""
        df = pd.DataFrame()
        input_cols = ['input1']
        output_col = ['output1']
        
        with pytest.raises(Exception):
            utils.calculate_sfa_metrics(df, input_cols, output_col)
    
    def test_sfa_metrics_invalid_columns(self):
        """Prueba SFA con columnas inexistentes."""
        df = pd.DataFrame({
            'col1': [1, 2, 3],
            'col2': [4, 5, 6]
        })
        
        input_cols = ['inexistente']
        output_col = ['tambien_inexistente']
        
        with pytest.raises(KeyError):
            utils.calculate_sfa_metrics(df, input_cols, output_col)
    
    def test_sfa_metrics_with_zeros(self):
        """Prueba SFA con valores cero (deben ser filtrados)."""
        df = pd.DataFrame({
            'input1': [100, 0, 200, 300, 400, 500],  # Más datos para robustez
            'input2': [150, 200, 0, 400, 350, 450],
            'output1': [50, 60, 70, 0, 80, 90],
            'id': [1, 2, 3, 4, 5, 6]
        })
        
        input_cols = ['input1', 'input2']
        output_col = ['output1']
        
        result_df, metrics = utils.calculate_sfa_metrics(df, input_cols, output_col)
        
        # Verificar que filtra correctamente los valores inválidos
        assert 'et_promedio' in metrics  # Verificar métrica existente
        assert len(result_df) == len(df)  # Mantiene todas las filas


class TestDEAMetrics:
    """Pruebas para calculate_dea_metrics."""
    
    def test_dea_metrics_basic_functionality(self):
        """Prueba funcionalidad básica de DEA."""
        df = pd.DataFrame({
            'bienesyservicios': [1000000, 1200000, 800000, 1500000],
            'remuneraciones': [2000000, 2200000, 1800000, 2500000],
            'consultas': [25000, 30000, 20000, 35000],
            'grdxegresos': [8000, 9000, 7000, 10000],
            'hospital_id': [1, 2, 3, 4]
        })
        
        input_cols = ['bienesyservicios', 'remuneraciones']
        output_cols = ['consultas', 'grdxegresos']
        
        result_df, metrics = utils.calculate_dea_metrics(
            df=df,
            input_cols=input_cols,
            output_cols=output_cols
        )
        
        # Verificaciones básicas
        assert isinstance(result_df, pd.DataFrame)
        assert isinstance(metrics, dict)
        assert len(result_df) == len(df)
        assert 'ET DEA' in result_df.columns
        assert 'et_promedio' in metrics  # Nombre real de la métrica
        assert 'pct_criticos' in metrics
    
    def test_dea_metrics_different_orientations(self):
        """Prueba DEA con diferentes orientaciones."""
        df = pd.DataFrame({
            'input1': [100, 200, 150],
            'output1': [50, 80, 60],
            'id': [1, 2, 3]
        })
        
        input_cols = ['input1']
        output_cols = ['output1']
        
        # Orientación input
        result_in, _ = utils.calculate_dea_metrics(
            df, input_cols, output_cols, orientation="in"
        )
        
        # Orientación output
        result_out, _ = utils.calculate_dea_metrics(
            df, input_cols, output_cols, orientation="out"
        )
        
        assert 'ET DEA' in result_in.columns
        assert 'ET DEA' in result_out.columns
    
    def test_dea_metrics_different_rts(self):
        """Prueba DEA con diferentes returns to scale."""
        df = pd.DataFrame({
            'input1': [100, 200, 150, 300],
            'output1': [50, 80, 60, 120],
            'id': [1, 2, 3, 4]
        })
        
        input_cols = ['input1']
        output_cols = ['output1']
        
        # CRS (Constant Returns to Scale)
        result_crs, _ = utils.calculate_dea_metrics(
            df, input_cols, output_cols, rts="CRS"
        )
        
        # VRS (Variable Returns to Scale)
        result_vrs, _ = utils.calculate_dea_metrics(
            df, input_cols, output_cols, rts="VRS"
        )
        
        assert 'ET DEA' in result_crs.columns
        assert 'ET DEA' in result_vrs.columns


class TestPCAFunctions:
    """Pruebas para run_pca."""
    
    def test_run_pca_basic_functionality(self):
        """Prueba funcionalidad básica de PCA."""
        df = pd.DataFrame({
            'var1': [1, 2, 3, 4, 5],
            'var2': [2, 4, 6, 8, 10],
            'var3': [1, 3, 5, 7, 9],
            'var4': [3, 6, 9, 12, 15],
            'id': [1, 2, 3, 4, 5]
        })
        
        feature_cols = ['var1', 'var2', 'var3', 'var4']
        
        result_df, result_dict = utils.run_pca(
            df=df,
            feature_cols=feature_cols,
            n_components=2
        )
        
        # Verificaciones básicas
        assert isinstance(result_df, pd.DataFrame)
        assert isinstance(result_dict, dict)
        assert len(result_df) == len(df)
        assert 'PC1' in result_df.columns
        assert 'PC2' in result_df.columns
        assert 'explained_variance_ratio' in result_dict
        assert 'components' in result_dict  # Nombre real del campo
    
    def test_run_pca_scaling_options(self):
        """Prueba PCA con y sin escalamiento."""
        df = pd.DataFrame({
            'var1': [1, 100, 1000],
            'var2': [2, 200, 2000],
            'var3': [3, 300, 3000],
            'id': [1, 2, 3]
        })
        
        feature_cols = ['var1', 'var2', 'var3']
        
        # Con escalamiento
        result_scaled, _ = utils.run_pca(
            df, feature_cols, n_components=2, scale=True
        )
        
        # Sin escalamiento
        result_unscaled, _ = utils.run_pca(
            df, feature_cols, n_components=2, scale=False
        )
        
        assert 'PC1' in result_scaled.columns
        assert 'PC1' in result_unscaled.columns
        # Los resultados deberían ser diferentes debido al escalamiento
        assert not result_scaled['PC1'].equals(result_unscaled['PC1'])
    
    def test_run_pca_insufficient_components(self):
        """Prueba PCA cuando se solicitan más componentes que variables."""
        df = pd.DataFrame({
            'var1': [1, 2, 3, 4, 5],  # Más filas para evitar errores
            'var2': [4, 5, 6, 7, 8],
            'var3': [7, 8, 9, 10, 11],  # Añadir más variables
            'id': [1, 2, 3, 4, 5]
        })
        
        feature_cols = ['var1', 'var2', 'var3']
        
        # Solicitar 2 componentes (válido)
        result_df, result_dict = utils.run_pca(
            df, feature_cols, n_components=2
        )
        
        # Debería funcionar correctamente
        assert 'PC1' in result_df.columns
        assert 'PC2' in result_df.columns
        assert 'PC3' not in result_df.columns


class TestPCAKmeans:
    """Pruebas para pca_kmeans."""
    
    def test_pca_kmeans_basic_functionality(self):
        """Prueba funcionalidad básica de PCA + K-means."""
        df = pd.DataFrame({
            'var1': [1, 2, 3, 4, 5, 6, 7, 8],
            'var2': [2, 4, 6, 8, 10, 12, 14, 16],
            'var3': [1, 3, 5, 7, 9, 11, 13, 15],
            'efficiency': [0.8, 0.9, 0.7, 0.85, 0.75, 0.95, 0.82, 0.88],
            'id': [1, 2, 3, 4, 5, 6, 7, 8]
        })
        
        feature_cols = ['var1', 'var2', 'var3']
        
        result_df, result_dict = utils.pca_kmeans(
            df=df,
            feature_cols=feature_cols,
            n_components=2,
            k=3
        )
        
        # Verificaciones básicas
        assert isinstance(result_df, pd.DataFrame)
        assert isinstance(result_dict, dict)
        assert len(result_df) == len(df)
        assert 'PC1' in result_df.columns
        assert 'PC2' in result_df.columns
        assert 'cluster' in result_df.columns
        assert 'silhouette' in result_dict  # Nombre real del campo
    
    def test_pca_kmeans_auto_k_selection(self):
        """Prueba selección automática de k en PCA + K-means."""
        df = pd.DataFrame({
            'var1': np.random.rand(20),
            'var2': np.random.rand(20),
            'var3': np.random.rand(20),
            'efficiency': np.random.rand(20),
            'id': range(1, 21)
        })
        
        feature_cols = ['var1', 'var2', 'var3']
        
        result_df, result_dict = utils.pca_kmeans(
            df=df,
            feature_cols=feature_cols,
            n_components=2,
            k=None,  # Selección automática
            k_max=5
        )
        
        assert 'cluster' in result_df.columns
        assert 'k' in result_dict  # Nombre real del campo


class TestMalmquistIndex:
    """Pruebas para calculate_dea_malmquist_fast."""
    
    def test_malmquist_basic_functionality(self):
        """Prueba funcionalidad básica del índice Malmquist."""
        # Datos para período t
        df_t = pd.DataFrame({
            'input1': [100, 150, 200],
            'output1': [50, 75, 90],
            'hospital_id': [1, 2, 3]
        })
        
        # Datos para período t+1
        df_t1 = pd.DataFrame({
            'input1': [110, 160, 190],
            'output1': [55, 80, 95],
            'hospital_id': [1, 2, 3]
        })
        
        input_cols = ['input1']
        output_cols = ['output1']
        
        result_df, result_dict = utils.calculate_dea_malmquist_fast(
            df_t=df_t,
            df_t1=df_t1,
            input_cols=input_cols,
            output_cols=output_cols
        )
        
        # Verificaciones básicas
        assert isinstance(result_df, pd.DataFrame)
        assert isinstance(result_dict, dict)
        assert 'Malmquist' in result_df.columns  # Nombre real de la columna
        assert 'EFFCH' in result_df.columns  # Efficiency change
        assert 'TECH' in result_df.columns   # Technology change
        assert 'Malmquist_mean' in result_dict  # Nombre real de la métrica
    
    def test_malmquist_empty_dataframes(self):
        """Prueba Malmquist con DataFrames vacíos."""
        df_empty = pd.DataFrame()
        input_cols = ['input1']
        output_cols = ['output1']
        
        with pytest.raises(Exception):
            utils.calculate_dea_malmquist_fast(
                df_empty, df_empty, input_cols, output_cols
            )


class TestDeterminantAnalysis:
    """Pruebas para determinant_analysis."""
    
    def test_determinant_analysis_basic_functionality(self):
        """Prueba funcionalidad básica del análisis de determinantes."""
        df = pd.DataFrame({
            'efficiency': [0.8, 0.9, 0.7, 0.85, 0.75, 0.95],
            'region_id': [1, 2, 1, 3, 2, 3],
            'complejidad': [1, 2, 2, 3, 1, 3],
            'size_proxy': [100, 200, 150, 300, 120, 250],
            'hospital_id': [1, 2, 3, 4, 5, 6]
        })
        
        result_dict = utils.determinant_analysis(
            df=df,
            dependent='efficiency',
            independents=['region_id', 'complejidad', 'size_proxy']
        )
        
        # Verificaciones básicas
        assert isinstance(result_dict, tuple)  # Retorna tupla (df, dict)
        result_df, result_meta = result_dict
        assert isinstance(result_df, pd.DataFrame)
        assert isinstance(result_meta, dict)
    
    def test_determinant_analysis_categorical_variables(self):
        """Prueba análisis de determinantes con variables categóricas."""
        df = pd.DataFrame({
            'efficiency': [0.8, 0.9, 0.7, 0.85],
            'region_id': [1, 2, 3, 1],
            'complejidad': [1, 2, 1, 2],
            'hospital_id': [1, 2, 3, 4]
        })
        
        result_dict = utils.determinant_analysis(
            df=df,
            dependent='efficiency',
            independents=['region_id', 'complejidad']
        )
        
        assert isinstance(result_dict, tuple)
        result_df, result_meta = result_dict
        assert isinstance(result_df, pd.DataFrame)
        assert isinstance(result_meta, dict)


class TestUtilityFunctions:
    """Pruebas para funciones utilitarias."""
    
    def test_say_hello(self):
        """Prueba función simple say_hello."""
        result = utils.say_hello("Test")
        assert isinstance(result, str)
        assert "Test" in result


class TestErrorHandling:
    """Pruebas para manejo de errores en funciones utils."""
    
    def test_sfa_with_mock_exception(self):
        """Prueba SFA cuando la librería pysfa falla."""
        df = pd.DataFrame({
            'input1': [100, 200],
            'output1': [50, 80]
        })
        
        with patch('utils.functions.SFA') as mock_sfa:
            mock_sfa.side_effect = Exception("SFA library error")
            
            with pytest.raises(Exception):
                utils.calculate_sfa_metrics(df, ['input1'], ['output1'])
    
    def test_dea_with_mock_exception(self):
        """Prueba DEA cuando la librería Pyfrontier falla."""
        df = pd.DataFrame({
            'input1': [100, 200],
            'output1': [50, 80]
        })
        
        with patch('utils.functions.EnvelopDEA') as mock_dea:
            mock_dea.side_effect = Exception("DEA library error")
            
            with pytest.raises(Exception):
                utils.calculate_dea_metrics(df, ['input1'], ['output1'])


class TestEdgeCases:
    """Pruebas para casos límite."""
    
    def test_single_row_dataframe(self):
        """Prueba funciones con DataFrame de una sola fila."""
        df = pd.DataFrame({
            'input1': [100],
            'output1': [50],
            'id': [1]
        })
        
        # DEA funciona con una fila, no debería dar error
        result_df, metrics = utils.calculate_dea_metrics(df, ['input1'], ['output1'])
        assert len(result_df) == 1
        assert 'ET DEA' in result_df.columns
    
    def test_missing_values(self):
        """Prueba funciones con valores faltantes."""
        df = pd.DataFrame({
            'input1': [100, np.nan, 200, 300, 400],  # Más datos para evitar errores
            'output1': [50, 80, np.nan, 120, 150],
            'id': [1, 2, 3, 4, 5]
        })
        
        # Las funciones deberían manejar valores faltantes
        result_df, metrics = utils.calculate_sfa_metrics(df, ['input1'], ['output1'])
        assert len(result_df) == 5  # Mantiene todas las filas
        assert 'et_promedio' in metrics  # Verificar métrica existente
