from fastapi import FastAPI, Depends, HTTPException
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
def run_sfa(year: int = 2014, db: Session = Depends(get_db)):
    """
    Ejecuta el análisis SFA para los hospitales del año especificado.
    
    Args:
        year: Año de los hospitales a analizar (por defecto 2014)
    Returns:
        Resultados del análisis SFA incluyendo eficiencia técnica y métricas
    """
    try:
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
        print(f"DataFrame para SFA:\n{df.head()}")
        
        # Definir columnas de entrada y salida
        input_cols = ['bienesyservicios', 'remuneraciones', 'diascamadisponibles']
        output_cols = ['consultas']  # ID del hospital como salida
        
        # Ejecutar SFA
        df_out, metrics = utils.calculate_sfa_metrics(df, input_cols, output_cols)
        
        print (f"Resultados del SFA:\n{df_out.head()}")
        print(f"Métricas SFA:\n{metrics}")
        print(f"Eficiencia promedio: {metrics['ET_promedio']:.2%}")
        print(f"% críticos:         {metrics['pct_criticos']:.2f}%")
        print(f"Variable clave:     {metrics['variable_clave']}")
        print(f"Varianza σ²:        {metrics['sigma2']:.2f}")

        # pasar columna 'ET SFA' a json
        df_out['ET SFA'] = df_out['ET SFA'].astype(float).round(4).tolist()

        resultado = df_out[['hospital_alternative_name', 'ET SFA']].to_dict('records')

        return {"data": resultado}
        # retornar solo columna 
        # return {
        #     "efficiency": df_out['ET SFA'].tolist(),
        #     "metrics": {
        #         "ET_promedio": metrics['ET_promedio'],
        #         "pct_criticos": metrics['pct_criticos'],
        #         "variable_clave": metrics['variable_clave'],
        #         "sigma2": metrics['sigma2'],
        #         "betas": metrics['betas'].tolist(),
        #         "p_values": metrics['p_values'].tolist()
        #     }
        # }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al ejecutar SFA: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el análisis SFA.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
