from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from database.database import get_db, engine, Base
from database import models, schemas # Importar los modelos y schemas
import logging
import utils.functions as utils

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Panel Eficiencia Hospitalaria API", version="1.0.0")

# Configurar CORS para permitir comunicación con el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear las tablas
models.Base.metadata.create_all(bind=engine) # Asegurar que las tablas de los modelos se creen

@app.get("/")
def read_root():
    return {"message": "Hello World - Connected to PostgreSQL!"}

@app.get("/db-status")
def check_db_status(db: Session = Depends(get_db)):
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
    Obtiene hospitales de la base de datos con filtros opcionales.
    
    Args:
        year: Año opcional para filtrar los hospitales (ej: 2014, 2015, etc.)
        region_id: ID de región opcional para filtrar (ej: 15, 1, etc.)
        complejidad: Nivel de complejidad opcional para filtrar (ej: 1, 2, 3, etc.)
    
    Returns:
        Lista de hospitales filtrados según los parámetros proporcionados.
    
    Examples:
        - GET /hospitals -> Todos los hospitales
        - GET /hospitals?year=2014 -> Solo hospitales del año 2014
        - GET /hospitals?year=2014&region_id=15 -> Hospitales del año 2014 en la región 15
        - GET /hospitals?complejidad=3 -> Solo hospitales de complejidad 3
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

@app.get("/hospitals/summary", response_model=List[schemas.HospitalSummary])
def get_hospitals_summary(db: Session = Depends(get_db)):
    """
    Obtiene un resumen de todos los hospitales (solo campos principales).
    
    Útil para listados rápidos sin cargar todos los detalles.
    """
    try:
        hospitals = db.query(models.Hospital).all()
        
        if not hospitals:
            raise HTTPException(status_code=404, detail="No se encontraron hospitales.")
            
        return hospitals
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener resumen de hospitales: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

@app.get("/hospitals/stats", response_model=schemas.HospitalStats)
def get_hospitals_stats(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas generales de los hospitales.
    
    Returns:
        Estadísticas agregadas como total de hospitales, consultas, etc.
    """
    try:
        from sqlalchemy import func
        
        # Consultar estadísticas
        total_hospitales = db.query(models.Hospital).count()
        
        if total_hospitales == 0:
            raise HTTPException(status_code=404, detail="No se encontraron hospitales.")
        
        # Suma total de consultas
        total_consultas = db.query(func.sum(models.Hospital.consultas)).scalar() or 0
        
        # Promedio de complejidad
        promedio_complejidad = db.query(func.avg(models.Hospital.complejidad)).scalar() or 0
        
        # Años únicos disponibles
        años_disponibles = db.query(models.Hospital.año).distinct().all()
        años_list = [año[0] for año in años_disponibles if año[0] is not None]
        años_list.sort()
        
        return schemas.HospitalStats(
            total_hospitales=total_hospitales,
            total_consultas=total_consultas,
            promedio_complejidad=round(promedio_complejidad, 2),
            años_disponibles=años_list
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener estadísticas de hospitales: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

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
    
# usar funcion say hello de utls/functions.py
@app.get("/hello")
def say_hello(name: str = "XD"):
    """
    Devuelve un saludo personalizado.
    
    Args:
        name: Nombre de la persona a saludar (por defecto "World")
    
    Returns:
        Saludo personalizado
    """
    try:
        greeting = utils.say_hello(name)
        return {"message": greeting}
    except Exception as e:
        logger.error(f"Error al saludar: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el saludo.")
    
# usar funcion sf calculate_sfa_metrics de utls/functions.py con hospitales filtrados 2014
@app.get("/sfa")
def run_sfa(
    year: int = 2014,
    input_cols: str = Query(default='bienesyservicios,remuneraciones,diascamadisponibles'),
    output_cols: str = Query(default='consultas'),
    db: Session = Depends(get_db)
):
    """
    Ejecuta el análisis SFA para los hospitales del año especificado y columnas seleccionadas.

    Args:
        year: Año de los hospitales a analizar (por defecto 2014)
        input_cols: Columnas de entrada separadas por comas (ej: 'col1,col2,col3')
        output_cols: Columnas de salida separadas por comas (ej: 'col1,col2')
    Returns:
        Resultados del análisis SFA incluyendo eficiencia técnica y métricas
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
    Ejecuta el análisis DEA para los hospitales del año especificado y columnas seleccionadas.
    
    Args:
        year: Año de los hospitales a analizar (por defecto 2014)
        input_cols: Columnas de entrada separadas por comas (ej: 'col1,col2,col3')
        output_cols: Columnas de salida separadas por comas (ej: 'col1,col2')
    Returns:
        Resultados del análisis DEA incluyendo eficiencia técnica y métricas
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
