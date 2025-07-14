from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
import logging
import numpy as np
import pandas as pd
import utils.functions as utils
import os

from database.database import get_db
from database import models, schemas

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
app = APIRouter()

@app.get("/health")
def health_check():
    """
    Endpoint de health check para monitorear el estado del sistema de análisis hospitalario.
    
    Verifica el estado operacional del API de eficiencia hospitalaria, incluyendo
    conectividad con base de datos PostgreSQL y disponibilidad de módulos de análisis.
    
    Utilizado por:
    - Balanceadores de carga para health checks
    - Sistemas de monitoreo y alertas
    - Pruebas de conectividad del frontend
    - Verificación de despliegue en contenedores
    
    Returns:
        Estado del servicio con información del entorno y versión
    """
    return {
        "status": "healthy",
        "service": "Panel Eficiencia Hospitalaria API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/")
def read_root():
    return {"message": "Hello World - Connected to PostgreSQL!"}

@app.get("/db-status")
def check_db_status(db: Session = Depends(get_db)):
    """
    Verifica el estado de conectividad con la base de datos PostgreSQL.
    
    Ejecuta una consulta simple para confirmar que la conexión a la base de datos
    está funcionando correctamente y que el sistema puede acceder a los datos
    hospitalarios almacenados.
    
    Returns:
        Estado de la conexión y resultado de la consulta de prueba
    """
    try:
        # Test de conexión simple
        result = db.execute(text("SELECT 1")).fetchone()
        return {
            "status": "connected", 
            "message": "Base de datos PostgreSQL conectada correctamente",
            "result": result[0] if result else None
        }
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/hospitals", response_model=List[schemas.HospitalResponse])
def get_all_hospitals_data(
    year: int = None, 
    region_id: int = None, 
    complejidad: int = None,
    db: Session = Depends(get_db)
):
    """
    Obtiene datos de hospitales del sistema de salud chileno con filtros opcionales.
    
    Retorna información completa de hospitales incluyendo indicadores operacionales,
    recursos disponibles y métricas de productividad hospitalaria.
    
    Args:
        year: Año de los datos hospitalarios (ej: 2014, 2015, 2016)
        region_id: ID de región administrativa de Chile (1-15)
        complejidad: Nivel de complejidad hospitalaria (1=Baja, 2=Media, 3=Alta)
    
    Returns:
        Lista de hospitales con datos de:
        - Recursos: remuneraciones, bienes y servicios, días-cama disponibles
        - Outputs: consultas, GRD por egresos, consultas de urgencia
        - Ubicación: latitud, longitud, región
        - Infraestructura: quirófanos, días-cama, capacidad de atención
    
    Examples:
        - GET /hospitals -> Todos los hospitales del sistema
        - GET /hospitals?year=2014 -> Hospitales con datos del año 2014
        - GET /hospitals?year=2014&region_id=15 -> Hospitales 2014 en Región de Arica
        - GET /hospitals?complejidad=3 -> Solo hospitales de alta complejidad
    """
    try:
        # Crear la consulta base
        query = db.query(models.Hospital)
        
        # Aplicar filtros si se proporcionan
        if year is not None:
            query = query.filter(models.Hospital.año == year)
            
        if region_id is not None:
            query = query.filter(models.Hospital.region_id == region_id)
            
        if complejidad is not None:
            query = query.filter(models.Hospital.complejidad == complejidad)
        
        # Ejecutar la consulta
        hospitals = query.all()
        
        if not hospitals:
            # Crear mensaje de error descriptivo basado en los filtros aplicados
            filters_applied = []
            if year is not None:
                filters_applied.append(f"año {year}")
            if region_id is not None:
                filters_applied.append(f"región {region_id}")
            if complejidad is not None:
                filters_applied.append(f"complejidad {complejidad}")
            
            if filters_applied:
                filter_message = " y ".join(filters_applied)
                raise HTTPException(
                    status_code=404, 
                    detail=f"No se encontraron hospitales para los filtros: {filter_message}."
                )
            else:
                raise HTTPException(status_code=404, detail="No se encontraron hospitales.")
            
        return hospitals
        
    except HTTPException:
        raise  # Re-lanzar HTTPExceptions
    except Exception as e:
        logger.error(f"Error al obtener datos de hospitales: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Error interno del servidor al procesar la solicitud."
        )

@app.get("/hospitals/{hospital_id}", response_model=schemas.HospitalResponse)
def get_hospital_by_id(hospital_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un hospital específico por su ID.
    
    Args:
        hospital_id: ID único del hospital
    
    Returns:
        Datos completos del hospital solicitado
    """
    try:
        hospital = db.query(models.Hospital).filter(models.Hospital.hospital_id == hospital_id).first()
        
        if not hospital:
            raise HTTPException(
                status_code=404, 
                detail=f"Hospital con ID {hospital_id} no encontrado."
            )
            
        return hospital
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener hospital con ID {hospital_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")
    
# usar funcion sf calculate_sfa_metrics de utls/functions.py con hospitales filtrados 2014
@app.get("/sfa")
def run_sfa(
    year: int = 2014,
    input_cols: str = Query(default='bienesyservicios,remuneraciones,diascamadisponibles'),
    output_cols: str = Query(default='consultas'),
    db: Session = Depends(get_db)
):
    """
    Ejecuta análisis de eficiencia técnica mediante Stochastic Frontier Analysis (SFA).
    
    Calcula la eficiencia técnica hospitalaria usando la metodología SFA que separa
    la ineficiencia del ruido estadístico, ideal para análisis de productividad en
    el sector salud donde factores externos pueden afectar el desempeño.
    
    Args:
        year: Año de análisis de hospitales (por defecto 2014)
        input_cols: Inputs hospitalarios separados por comas (recursos)
        output_cols: Outputs hospitalarios separados por comas (productos)
    
    Returns:
        - results: Datos de hospitales con eficiencia técnica SFA calculada
        - metrics: Métricas del análisis (ET promedio, % críticos, variable clave)
    
    Inputs típicos:
        - bienesyservicios: Gasto en bienes y servicios
        - remuneraciones: Gasto en personal médico y administrativo
        - diascamadisponibles: Capacidad instalada de camas
    
    Outputs típicos:
        - consultas: Número de consultas médicas atendidas
        - grdxegresos: Grupos relacionados por diagnóstico por egresos
        - consultasurgencias: Consultas de urgencia atendidas
    """
    try:
        # Convertir strings separadas por comas a listas
        input_cols_list = [col.strip() for col in input_cols.split(',')]
        output_cols_list = [col.strip() for col in output_cols.split(',')]
        
        # Obtener hospitales del año especificado
        hospitals = db.query(models.Hospital).filter(models.Hospital.año == year).all()

        if not hospitals:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron hospitales para el año {year}."
            )

        # Convertir a DataFrame para análisis
        import pandas as pd
        df = pd.DataFrame([h.__dict__ for h in hospitals])
        df.drop(columns=['_sa_instance_state'], inplace=True)  # Eliminar columna interna de SQLAlchemy

        # Validar que las columnas existan en el DataFrame
        missing_inputs = [col for col in input_cols_list if col not in df.columns]
        missing_outputs = [col for col in output_cols_list if col not in df.columns]
        if missing_inputs or missing_outputs:
            raise HTTPException(
                status_code=400,
                detail=f"Columnas no encontradas. Inputs faltantes: {missing_inputs}, Outputs faltantes: {missing_outputs}"
            )

        # Ejecutar SFA
        df_out, metrics = utils.calculate_sfa_metrics(df, input_cols_list, output_cols_list)

        # Convertir resultados a lista de diccionarios para respuesta JSON
        results = df_out.to_dict(orient='records')
        metrics['year'] = year  # Añadir año a las métricas
        metrics['input_cols'] = input_cols_list
        metrics['output_cols'] = output_cols_list
        logger.info(f"Resultados SFA para el año {year}: {metrics}")
        return {
            "results": results,
            "metrics": metrics
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al ejecutar SFA: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el análisis SFA.")
    
@app.get("/dea")
def run_dea(
    year: int = 2014,
    input_cols: str = Query(default='bienesyservicios,remuneraciones,diascamadisponibles'),
    output_cols: str = Query(default='consultas'),
    db: Session = Depends(get_db)
):
    """
    Ejecuta análisis de eficiencia técnica mediante Data Envelopment Analysis (DEA).
    
    Calcula la eficiencia técnica hospitalaria usando la metodología DEA basada en
    programación lineal. Identifica la frontera eficiente y mide la distancia de
    cada hospital a esta frontera, proporcionando insights sobre mejores prácticas.
    
    Args:
        year: Año de análisis de hospitales (por defecto 2014)
        input_cols: Inputs hospitalarios separados por comas (recursos)
        output_cols: Outputs hospitalarios separados por comas (productos)
    
    Returns:
        - results: Datos de hospitales con eficiencia técnica DEA calculada
        - metrics: Métricas del análisis (ET promedio, % críticos, variable slack clave)
    
    Ventajas del DEA:
        - No requiere forma funcional específica
        - Maneja múltiples inputs y outputs
        - Identifica hospitales de referencia (benchmarks)
        - Proporciona targets de mejora específicos
    """
    try:
        # Convertir strings separadas por comas a listas
        input_cols_list = [col.strip() for col in input_cols.split(',')]
        output_cols_list = [col.strip() for col in output_cols.split(',')]
        
        # Obtener hospitales del año especificado
        hospitals = db.query(models.Hospital).filter(models.Hospital.año == year).all()
        
        if not hospitals:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron hospitales para el año {year}."
            )
        
        # Convertir a DataFrame para análisis
        import pandas as pd
        df = pd.DataFrame([h.__dict__ for h in hospitals])
        df.drop(columns=['_sa_instance_state'], inplace=True)  # Eliminar columna interna de SQLAlchemy
        
        # Validar que las columnas existan en el DataFrame
        missing_inputs = [col for col in input_cols_list if col not in df.columns]
        missing_outputs = [col for col in output_cols_list if col not in df.columns]
        if missing_inputs or missing_outputs:
            raise HTTPException(
                status_code=400,
                detail=f"Columnas no encontradas. Inputs faltantes: {missing_inputs}, Outputs faltantes: {missing_outputs}"
            )
        
        # Ejecutar DEA
        df_out, metrics = utils.calculate_dea_metrics(df, input_cols_list, output_cols_list)

        # Convertir resultados a lista de diccionarios para respuesta JSON
        results = df_out.to_dict(orient='records')
        metrics['year'] = year  # Añadir año a las métricas
        metrics['input_cols'] = input_cols_list  
        metrics['output_cols'] = output_cols_list
        logger.info(f"Resultados DEA para el año {year}: {metrics}")
        return {
            "results": results,
            "metrics": metrics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al ejecutar DEA: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el análisis DEA.")

@app.get("/pca-clustering")
def run_pca_clustering(
    year: int = 2014,
    input_cols: str = Query(default='bienesyservicios,remuneraciones,diascamadisponibles'),
    output_cols: str = Query(default='grdxegresos'),
    method: str = Query(default='DEA'),
    n_components: int = Query(default=2, ge=1, le=10),
    k: int = Query(default=None, ge=2, le=20),
    k_max: int = Query(default=10, ge=2, le=20),
    scale: bool = Query(default=True),
    random_state: int = Query(default=42),
    db: Session = Depends(get_db)
):
    """
    Ejecuta análisis PCA + K-means clustering para segmentación hospitalaria avanzada.
    
    Combina reducción de dimensionalidad (PCA) con clustering no supervisado para
    identificar grupos homogéneos de hospitales basados en eficiencia técnica y
    características operacionales.
    
    Metodología:
    1. Calcula eficiencia técnica (SFA/DEA) previa
    2. Aplica PCA para reducir dimensionalidad
    3. Ejecuta K-means clustering en espacio reducido
    4. Valida calidad de clusters con métricas de silhouette
    
    Aplicaciones:
    - Segmentación estratégica de hospitales
    - Identificación de grupos de benchmarking
    - Políticas diferenciadas por tipo de hospital
    - Análisis de patrones operacionales
    
    Args:
        year: Año de análisis hospitalario
        input_cols: Inputs para cálculo de eficiencia
        output_cols: Outputs para cálculo de eficiencia
        method: Método de eficiencia ('DEA' o 'SFA')
        n_components: Componentes principales a retener
        k: Número fijo de clusters (None para selección automática)
        k_max: Máximo número de clusters para auto-selección
        scale: Estandarización previa al PCA
        random_state: Semilla de reproducibilidad
    
    Returns:
        - results: Hospitales con asignación de clusters y componentes principales
        - metrics: Métricas de calidad (silhouette, varianza explicada)
        - cluster_summary: Perfil estadístico de cada cluster
    """
    try:
        # Convertir strings separados por comas a listas
        input_cols_list = [col.strip() for col in input_cols.split(',')]
        output_cols_list = [col.strip() for col in output_cols.split(',')]
        
        # Crear feature_cols_list como la unión de inputs y outputs
        feature_cols_list = input_cols_list + output_cols_list
        
        # Obtener hospitales del año especificado
        hospitals = db.query(models.Hospital).filter(models.Hospital.año == year).all()
        
        if not hospitals:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron hospitales para el año {year}."
            )
        
        # Convertir a DataFrame para análisis
        import pandas as pd
        df = pd.DataFrame([h.__dict__ for h in hospitals])
        df.drop(columns=['_sa_instance_state'], inplace=True)  # Eliminar columna interna de SQLAlchemy
          # Validar que las columnas existan en el DataFrame
        missing_inputs = [col for col in input_cols_list if col not in df.columns]
        missing_outputs = [col for col in output_cols_list if col not in df.columns]
        
        if missing_inputs:
            raise HTTPException(
                status_code=400,
                detail=f"Columnas de entrada no encontradas: {missing_inputs}. Columnas disponibles: {list(df.columns)}"
            )
        
        if missing_outputs:
            raise HTTPException(
                status_code=400,
                detail=f"Columnas de salida no encontradas: {missing_outputs}. Columnas disponibles: {list(df.columns)}"
            )
        
        # Verificar que hay suficientes hospitales para clustering
        if len(df) < 2:
            raise HTTPException(
                status_code=400,
                detail="Se necesitan al menos 2 hospitales para realizar clustering."
            )
        
        # Si k es None, usar auto-selección; si no, validar que k <= número de hospitales
        if k is not None and k > len(df):
            raise HTTPException(
                status_code=400,
                detail=f"El número de clusters (k={k}) no puede ser mayor que el número de hospitales ({len(df)})."
            )
          # Calcular eficiencia técnica primero
        if method.upper() == 'DEA':
            df_with_efficiency, efficiency_metrics = utils.calculate_dea_metrics(
                df=df,
                input_cols=input_cols_list,
                output_cols=output_cols_list,
                orientation="in",
                rts="CRS",
                te_threshold=0.6
            )
            efficiency_col = 'ET DEA'
        elif method.upper() == 'SFA':
            # Para SFA necesitamos un solo output, usamos el primero si hay múltiples
            if len(output_cols_list) > 1:
                logger.warning(f"SFA requiere un solo output, usando solo el primero: {output_cols_list[0]}")
                sfa_output_cols = [output_cols_list[0]]  # Usar solo el primer output
            else:
                sfa_output_cols = output_cols_list
            
            df_with_efficiency, efficiency_metrics = utils.calculate_sfa_metrics(
                df=df,
                input_cols=input_cols_list,
                output_col=sfa_output_cols,
                te_threshold=0.6
            )
            efficiency_col = 'ET SFA'
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Método no válido: {method}. Use 'DEA' o 'SFA'."
            )
        
        # Ejecutar PCA + K-means (solo con las variables de entrada, no incluir eficiencia en PCA)
        df_out, cluster_meta = utils.pca_kmeans(
            df=df_with_efficiency,
            feature_cols=feature_cols_list,
            n_components=n_components,
            k=k,
            k_max=min(k_max, len(df_with_efficiency)),  # Asegurar que k_max no exceda el número de hospitales
            scale=scale,
            random_state=random_state
        )
        
        # Convertir resultados a lista de diccionarios para respuesta JSON
        results = df_out.to_dict(orient='records')
          # Preparar métricas para respuesta
        metrics = {
            'year': year,
            'input_cols': input_cols_list,
            'output_cols': output_cols_list,
            'feature_cols': feature_cols_list,  # Unión de inputs y outputs para PCA
            'method': method,
            'efficiency_col': efficiency_col,
            'n_components': n_components,
            'k_clusters': cluster_meta['k'],
            'silhouette_score': cluster_meta['silhouette'],
            'explained_variance_ratio': cluster_meta['explained_variance_ratio'],
            'total_variance_explained': sum(cluster_meta['explained_variance_ratio']),
            'scale_applied': scale,
            'random_state': random_state,
            'n_hospitals': len(df_out),
            'efficiency_metrics': efficiency_metrics
        }
        
        # Convertir matriz de componentes a formato serializable
        components_matrix = cluster_meta['components'].to_dict(orient='index')
        
        # Convertir centros de clusters a formato serializable
        cluster_centers = cluster_meta['cluster_centers'].to_dict(orient='index')
          # Calcular resumen estadístico por cluster (incluyendo eficiencia técnica)
        cluster_summary = df_out.groupby('cluster').agg({
            'cluster': 'size',  # Contar hospitales por cluster
            **{col: 'mean' for col in feature_cols_list if col in df_out.columns},  # Promedio de todas las features (inputs + outputs) por cluster
            efficiency_col: 'mean'  # Promedio de eficiencia técnica por cluster
        }).round(3).to_dict(orient='index')
        
        # Renombrar la columna 'cluster' a 'n_hospitals' en el resumen
        for cluster_id in cluster_summary:
            cluster_summary[cluster_id]['n_hospitals'] = cluster_summary[cluster_id].pop('cluster')
        
        logger.info(f"PCA + Clustering ejecutado para {year}: {cluster_meta['k']} clusters, "
                   f"silhouette={cluster_meta['silhouette']:.3f}, método={method}")
        
        return {
            "results": results,
            "metrics": metrics,
            "components_matrix": components_matrix,
            "cluster_centers": cluster_centers,
            "cluster_summary": cluster_summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al ejecutar PCA + Clustering: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor al procesar el análisis PCA + Clustering: {str(e)}")

@app.get("/pca")
def run_pca(
    year: int = 2014,
    feature_cols: str = Query(default='bienesyservicios,remuneraciones,diascamadisponibles,consultas'),
    n_components: int = Query(default=2, ge=1, le=10),
    scale: bool = Query(default=True),
    db: Session = Depends(get_db)
):
    """
    Ejecuta análisis de componentes principales (PCA) para reducción de dimensionalidad.
    
    Aplica PCA a variables hospitalarias para identificar patrones latentes y
    reducir la complejidad multivariada del análisis hospitalario.
    
    Utilidad del PCA en análisis hospitalario:
    - Identificación de factores subyacentes de desempeño
    - Visualización de relaciones multivariadas
    - Reducción de ruido en datos hospitalarios
    - Creación de índices sintéticos de performance
    
    Args:
        year: Año de análisis hospitalario
        feature_cols: Variables hospitalarias para análisis PCA
        n_components: Número de componentes principales a extraer
        scale: Estandarización previa (recomendado para variables heterogéneas)
    
    Returns:
        - results: Datos originales con componentes principales agregados
        - metrics: Varianza explicada por cada componente
        - components_matrix: Matriz de cargas factoriales
    
    Interpretación:
        - Componente 1: Usualmente representa "tamaño" hospitalario
        - Componente 2: Frecuentemente asociado a "eficiencia operacional"
        - Cargas altas indican variables más importantes por componente
    """
    try:
        # Convertir string separado por comas a lista
        feature_cols_list = [col.strip() for col in feature_cols.split(',')]
        
        # Obtener hospitales del año especificado
        hospitals = db.query(models.Hospital).filter(models.Hospital.año == year).all()
        
        if not hospitals:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron hospitales para el año {year}."
            )
        
        # Convertir a DataFrame para análisis
        import pandas as pd
        df = pd.DataFrame([h.__dict__ for h in hospitals])
        df.drop(columns=['_sa_instance_state'], inplace=True)  # Eliminar columna interna de SQLAlchemy
        
        # Validar que las columnas existan en el DataFrame
        missing_features = [col for col in feature_cols_list if col not in df.columns]
        if missing_features:
            raise HTTPException(
                status_code=400,
                detail=f"Columnas no encontradas para PCA: {missing_features}. Columnas disponibles: {list(df.columns)}"
            )
        
        # Ejecutar PCA
        df_pca, pca_meta = utils.run_pca(
            df=df,
            feature_cols=feature_cols_list,
            n_components=n_components,
            scale=scale
        )
        
        # Combinar datos originales con componentes principales
        df_combined = pd.concat([df, df_pca], axis=1)
        
        # Convertir resultados a lista de diccionarios para respuesta JSON
        results = df_combined.to_dict(orient='records')
        
        # Preparar métricas para respuesta
        metrics = {
            'year': year,
            'feature_cols': feature_cols_list,
            'n_components': n_components,
            'explained_variance_ratio': pca_meta['explained_variance_ratio'],
            'total_variance_explained': sum(pca_meta['explained_variance_ratio']),
            'scale_applied': scale,
            'n_hospitals': len(df_combined)
        }
        
        # Convertir matriz de componentes a formato serializable
        components_matrix = pca_meta['components'].to_dict(orient='index')
        
        logger.info(f"PCA ejecutado para {year}: {n_components} componentes, "
                   f"varianza explicada={sum(pca_meta['explained_variance_ratio']):.2%}")
        
        return {
            "results": results,
            "metrics": metrics,
            "components_matrix": components_matrix
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al ejecutar PCA: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor al procesar el análisis PCA: {str(e)}")
    
@app.get("/malmquist")
def run_malmquist(
    year_t: int = 2014,
    year_t1: int = 2016,
    input_cols: str = Query(default='bienesyservicios,remuneraciones'),
    output_cols: str = Query(default='consultas'),
    top_input_col: str = Query(default='remuneraciones'),
    db: Session = Depends(get_db)
):
    """
    Ejecuta análisis Malmquist DEA para evaluar cambios en productividad hospitalaria.
    
    Descompone el cambio en productividad entre dos períodos en:
    - Cambio en eficiencia técnica (catch-up effect)
    - Cambio tecnológico (frontier shift)
    - Índice Malmquist total (productividad total)
    
    Esencial para:
    - Evaluación de políticas de salud
    - Identificación de mejores prácticas temporales
    - Análisis de impacto de inversiones hospitalarias
    - Benchmarking dinámico entre hospitales
    
    Args:
        year_t: Año inicial del análisis (período base)
        year_t1: Año final del análisis (período comparativo)
        input_cols: Recursos hospitalarios (remuneraciones, bienes, camas)
        output_cols: Productos hospitalarios (consultas, egresos, urgencias)
        top_input_col: Variable para seleccionar hospitales representativos
    
    Returns:
        - results: Índices Malmquist por hospital con geolocalización
        - metrics: Estadísticas agregadas de cambio en productividad
        - analysis_info: Metadata del análisis temporal
    """
    try:
        # Convertir strings separados por comas a listas
        input_cols_list = [col.strip() for col in input_cols.split(',')]
        output_cols_list = [col.strip() for col in output_cols.split(',')]
        
        # Validar que los años sean diferentes
        if year_t == year_t1:
            raise HTTPException(
                status_code=400,
                detail="Los años deben ser diferentes para el análisis Malmquist."
            )

        # Validar top_input_col si se especifica
        if top_input_col and top_input_col not in input_cols_list:
            raise HTTPException(
                status_code=400,
                detail=f"top_input_col '{top_input_col}' debe estar en input_cols: {input_cols_list}",
                headers={"X-Error": "Invalid top_input_col"}
            )
        
        # Obtener hospitales para ambos años usando consultas SQL directas
        # (Evita problemas de cache de SQLAlchemy con múltiples consultas por año)
        sql_query = text("""
            SELECT hospital_id, region_id, hospital_name, hospital_alternative_name,
                   latitud, longitud, consultas, grdxegresos, bienesyservicios, 
                   remuneraciones, diascamadisponibles, consultasurgencias, 
                   examenes, quirofanos, año, complejidad
            FROM hospitals 
            WHERE año = :year
        """)
        
        # Obtener datos para year_t
        result_t = db.execute(sql_query, {"year": year_t}).fetchall()
        hospitals_t = [
            {
                "hospital_id": row[0],
                "region_id": row[1], 
                "hospital_name": row[2],
                "hospital_alternative_name": row[3],
                "latitud": float(row[4]) if row[4] is not None else None,
                "longitud": float(row[5]) if row[5] is not None else None,
                "consultas": int(row[6]) if row[6] is not None else None,
                "grdxegresos": float(row[7]) if row[7] is not None else None,
                "bienesyservicios": int(row[8]) if row[8] is not None else None,
                "remuneraciones": int(row[9]) if row[9] is not None else None,
                "diascamadisponibles": int(row[10]) if row[10] is not None else None,
                "consultasurgencias": int(row[11]) if row[11] is not None else None,
                "examenes": float(row[12]) if row[12] is not None else None,
                "quirofanos": float(row[13]) if row[13] is not None else None,
                "año": int(row[14]),
                "complejidad": int(row[15]) if row[15] is not None else None
            }
            for row in result_t
        ]
        
        # Obtener datos para year_t1  
        result_t1 = db.execute(sql_query, {"year": year_t1}).fetchall()
        hospitals_t1 = [
            {
                "hospital_id": row[0],
                "region_id": row[1], 
                "hospital_name": row[2],
                "hospital_alternative_name": row[3],
                "latitud": float(row[4]) if row[4] is not None else None,
                "longitud": float(row[5]) if row[5] is not None else None,
                "consultas": int(row[6]) if row[6] is not None else None,
                "grdxegresos": float(row[7]) if row[7] is not None else None,
                "bienesyservicios": int(row[8]) if row[8] is not None else None,
                "remuneraciones": int(row[9]) if row[9] is not None else None,
                "diascamadisponibles": int(row[10]) if row[10] is not None else None,
                "consultasurgencias": int(row[11]) if row[11] is not None else None,
                "examenes": float(row[12]) if row[12] is not None else None,
                "quirofanos": float(row[13]) if row[13] is not None else None,
                "año": int(row[14]),
                "complejidad": int(row[15]) if row[15] is not None else None
            }
            for row in result_t1
        ]
        
        # Validar que se encontraron datos para ambos años
        if not hospitals_t:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron hospitales para el año {year_t}."
            )
        
        if not hospitals_t1:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron hospitales para el año {year_t1}."
            )

        # Convertir listas de diccionarios a DataFrames para el análisis
        df_hospitals_t = pd.DataFrame(hospitals_t)
        df_hospitals_t1 = pd.DataFrame(hospitals_t1)

        # Ejecutar análisis Malmquist
        df_malmquist, summary = utils.calculate_dea_malmquist_fast(
            df_hospitals_t, df_hospitals_t1, 
            input_cols_list, output_cols_list,
            top_input_col=top_input_col,
            rts='CRS', orientation='in', 
            use_cross=True,
            top_n=30, max_dmus=None, n_jobs=4
        )
        
        # Crear diccionarios de mapeo para hospital_id -> información del hospital
        # Usar hospitals_t ya que contiene los IDs que están en df_malmquist
        hospital_info = {
            h['hospital_id']: {
                'hospital_name': h['hospital_name'],
                'hospital_alternative_name': h['hospital_alternative_name'],
                'latitud': h['latitud'],
                'longitud': h['longitud'],
                'region_id': h['region_id'],
                'complejidad': h['complejidad']
            } for h in hospitals_t
        }
        
        # Procesar resultados
        results = df_malmquist.reset_index().to_dict(orient='records')
        
        # Agregar información del hospital a cada resultado
        for result in results:
            hospital_id = result.get('hospital_id')
            if hospital_id in hospital_info:
                result.update(hospital_info[hospital_id])
            else:
                # Fallback si no se encuentra la información
                result['hospital_name'] = f"Hospital {hospital_id}"
                result['latitud'] = None
                result['longitud'] = None
                result['region_id'] = None
                result['complejidad'] = None
        
        # Estadísticas de resumen
        malmquist_values = df_malmquist['Malmquist'].values
        pct_delta_values = df_malmquist['%ΔProd'].values
        
        # Crear métricas en el formato esperado por el frontend
        metrics = {
            'delta_prod_promedio': float(np.mean(pct_delta_values)),
            'delta_eficiencia_promedio': float(np.mean(df_malmquist['EFFCH'].values)),
            'delta_tecnologia_promedio': float(np.mean(df_malmquist['TECH'].values)),
            'pct_hosp_mejorados': float((malmquist_values > 1).sum() / len(malmquist_values) * 100),
            'malmquist_mean': float(np.mean(malmquist_values)),
            'malmquist_median': float(np.median(malmquist_values)),
            'malmquist_std': float(np.std(malmquist_values)),
            'productivity_improved': int((malmquist_values > 1).sum()),
            'productivity_declined': int((malmquist_values < 1).sum()),
            'productivity_unchanged': int((malmquist_values == 1).sum()),
            'n_hospitals': len(results)
        }
        
        return {
            "results": results,  # Cambiar de detailed_results a results para consistencia
            "metrics": metrics,   # Agregar métricas en el formato esperado
            "analysis_info": {
                "year_t": year_t,
                "year_t1": year_t1,
                "hospitals_t_count": len(hospitals_t),
                "hospitals_t1_count": len(hospitals_t1),
                "input_columns": input_cols_list,
                "output_columns": output_cols_list,
                "top_input_column": top_input_col
            },
            "summary": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al ejecutar análisis Malmquist: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor al procesar el análisis Malmquist: {str(e)}")

@app.get("/determinantes-efficiency")
def analisis_determinantes_eficiencia(
    efficiency_method: str = Query(default="DEA", description="Método de eficiencia: 'SFA' o 'DEA'"),
    independent_vars: str = Query(..., description="Variables independientes separadas por comas"),
    input_cols: str = Query(..., description="Columnas de inputs separadas por comas"),
    output_cols: str = Query(..., description="Columnas de outputs separadas por comas"),
    year: int = Query(default=None, description="Año para filtrar datos"),
    top_n: int = Query(default=5, description="Número de determinantes clave"),
    db: Session = Depends(get_db)
):
    """
    Analiza los determinantes de eficiencia hospitalaria mediante regresión econométrica.
    
    Este análisis identifica qué factores influyen significativamente en la eficiencia
    técnica hospitalaria, proporcionando insights para la gestión y política sanitaria.
    
    Metodología:
    1. Calcula eficiencia técnica (SFA/DEA) como variable dependiente
    2. Ejecuta regresión OLS con variables explicativas
    3. Identifica determinantes estadísticamente significativos
    4. Rankea factores por importancia relativa
    
    Aplicaciones:
    - Diseño de políticas de mejora hospitalaria
    - Identificación de factores críticos de eficiencia
    - Benchmarking basado en características institucionales
    - Evaluación de impacto de variables contextuales
    
    Args:
        efficiency_method: Método de cálculo de eficiencia ('SFA' o 'DEA')
        independent_vars: Variables explicativas (complejidad, región, etc.)
        input_cols: Inputs para cálculo de eficiencia
        output_cols: Outputs para cálculo de eficiencia
        year: Año específico de análisis
        top_n: Número de determinantes principales a reportar
    
    Returns:
        - coeficientes: Resultados de regresión con significancia estadística
        - variables_clave: Determinantes más importantes
        - r_cuadrado: Capacidad explicativa del modelo
    """
    try:
        # Parsear listas
        independent_vars_list = [v.strip() for v in independent_vars.split(',')]
        input_cols_list = [v.strip() for v in input_cols.split(',')]
        output_cols_list = [v.strip() for v in output_cols.split(',')]
        
        logger.info(f"Análisis determinantes eficiencia: {efficiency_method} con inputs: {input_cols_list}, outputs: {output_cols_list}")
        
        # Obtener datos de hospitales
        query = db.query(models.Hospital)
        
        # Aplicar filtros si se proporcionan
        if year is not None:
            query = query.filter(models.Hospital.año == year)
        hospitales = query.all()
        
        if not hospitales:
            raise HTTPException(status_code=404, detail="No se encontraron hospitales con los filtros especificados")
        
        # Convertir a DataFrame
        df = pd.DataFrame([{
            'hospital_id': h.hospital_id,
            'hospital_name': h.hospital_name,
            'region_id': h.region_id,
            'latitud': h.latitud,
            'longitud': h.longitud,
            'consultas': h.consultas,
            'grdxegresos': h.grdxegresos,
            'bienesyservicios': h.bienesyservicios,
            'remuneraciones': h.remuneraciones,
            'diascamadisponibles': h.diascamadisponibles,
            'consultasurgencias': h.consultasurgencias,
            'examenes': h.examenes,
            'quirofanos': h.quirofanos,
            'año': h.año,
            'complejidad': h.complejidad
        } for h in hospitales])
        
        # Verificar que las columnas existen
        all_columns = set(df.columns)
        missing_inputs = [col for col in input_cols_list if col not in all_columns]
        missing_outputs = [col for col in output_cols_list if col not in all_columns]
        missing_independents = [col for col in independent_vars_list if col not in all_columns]
        
        if missing_inputs:
            raise HTTPException(status_code=400, detail=f"Columnas de input no encontradas: {missing_inputs}")
        if missing_outputs:
            raise HTTPException(status_code=400, detail=f"Columnas de output no encontradas: {missing_outputs}")
        if missing_independents:
            raise HTTPException(status_code=400, detail=f"Variables independientes no encontradas: {missing_independents}")
        
        # Ejecutar análisis de determinantes con cálculo automático de eficiencia
        coef_table, meta = utils.determinant_analysis(
            df=df,
            dependent="eficiencia",  # Esto activará el cálculo automático de SFA/DEA
            independents=independent_vars_list,
            efficiency_method=efficiency_method,
            input_cols=input_cols_list,
            output_cols=output_cols_list,
            top_n=top_n,
            add_constant=True
        )
        
        # Formatear respuesta
        coeficientes = []
        for _, row in coef_table.iterrows():
            # Manejar valores no finitos (inf, -inf, nan) que no son JSON serializables
            coef_val = float(row['Coef.']) if np.isfinite(row['Coef.']) else 0.0
            stderr_val = float(row['Std.Err.']) if np.isfinite(row['Std.Err.']) else 0.0
            t_val = float(row['t']) if np.isfinite(row['t']) else 0.0
            p_val = float(row['P>|t|']) if np.isfinite(row['P>|t|']) else 1.0
            
            coef = {
                "variable": row['variable'],
                "coeficiente": coef_val,
                "error_estandar": stderr_val,
                "t_value": t_val,
                "p_value": p_val,
                "significativo": bool(p_val < 0.05 and np.isfinite(row['P>|t|']))
            }
            coeficientes.append(coef)
        
        respuesta = {
            "variable_dependiente": meta['dependent_variable'],
            "variables_independientes": independent_vars_list,
            "metodo_eficiencia": meta['method'],
            "input_cols": input_cols_list,
            "output_cols": output_cols_list,
            "coeficientes": coeficientes,
            "variables_clave": meta['top_vars'],
            "r_cuadrado": float(meta['r2']) if np.isfinite(meta['r2']) else 0.0,
            "r_cuadrado_ajustado": float(meta['r2_adj']) if np.isfinite(meta['r2_adj']) else 0.0,
            "observaciones": meta['n_observations'],
            "mensaje": f"Análisis de determinantes completado usando {efficiency_method}. {len(coeficientes)} coeficientes calculados."
        }
        
        logger.info(f"Análisis determinantes eficiencia completado. R² = {meta['r2']:.3f}, método = {efficiency_method}")
        return respuesta
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en análisis determinantes eficiencia: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")