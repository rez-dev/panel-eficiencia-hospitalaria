from pydantic import BaseModel, Field
from typing import Optional

class HospitalBase(BaseModel):
    """Esquema base para Hospital con campos comunes"""
    hospital_name: str = Field(..., description="Nombre del hospital")
    region_id: int = Field(..., description="ID de la región")
    hospital_alternative_name: Optional[str] = Field(None, description="Nombre alternativo del hospital")
    latitud: float = Field(..., description="Latitud del hospital")
    longitud: float = Field(..., description="Longitud del hospital")
    consultas: int = Field(..., description="Número de consultas")
    grdxegresos: float = Field(..., description="GRD por egreso")
    bienesyservicios: int = Field(..., description="Gastos en bienes y servicios")
    remuneraciones: int = Field(..., description="Gastos en remuneraciones")
    diascamadisponibles: int = Field(..., description="Días cama disponibles")
    consultasurgencias: int = Field(..., description="Consultas de urgencias")
    examenes: float = Field(..., description="Número de exámenes")
    quirofanos: float = Field(..., description="Número de quirófanos")
    año: int = Field(..., description="Año de los datos")
    complejidad: int = Field(..., description="Nivel de complejidad del hospital")
    indiceocupacional: float = Field(..., description="Índice de ocupación")
    indicerotacion: float = Field(..., description="Índice de rotación")
    promediodiasestadia: float = Field(..., description="Promedio de días de estadía")
    letalidad: float = Field(..., description="Tasa de letalidad")
    egresosfallecidos: float = Field(..., description="Número de egresos fallecidos")
    region: Optional[str] = Field(None, description="Nombre de la región")

class HospitalResponse(HospitalBase):
    """Esquema para respuestas de Hospital (incluye ID)"""
    hospital_id: int = Field(..., description="ID único del hospital")
    
    class Config:
        from_attributes = True  # Permite convertir objetos SQLAlchemy a Pydantic
        
        # Ejemplo de respuesta para la documentación automática
        json_schema_extra = {
            "example": {
                "hospital_id": 101100,
                "region_id": 15,
                "hospital_name": "Hospital Dr. Juan Noé Crevanni (Arica)",
                "hospital_alternative_name": "Hospital Doctor Juan Noé",                
                "latitud": -18.4827,
                "longitud": -70.3126,
                "consultas": 184208,
                "grdxegresos": 11953.83,
                "bienesyservicios": 19779704,
                "remuneraciones": 10982608,
                "diascamadisponibles": 113311,
                "consultasurgencias": 139557,
                "examenes": 898535.0,
                "quirofanos": 178.0,
                "año": 2014,
                "complejidad": 3
            }
        }

class HospitalCreate(HospitalBase):
    """Esquema para crear un nuevo Hospital (sin ID)"""
    pass

class HospitalUpdate(BaseModel):
    """Esquema para actualizar un Hospital (todos los campos opcionales)"""
    hospital_name: Optional[str] = None
    region_id: Optional[int] = None
    hospital_alternative_name: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    consultas: Optional[int] = None
    grdxegresos: Optional[float] = None
    bienesyservicios: Optional[int] = None
    remuneraciones: Optional[int] = None
    diascamadisponibles: Optional[int] = None
    consultasurgencias: Optional[int] = None
    examenes: Optional[float] = None
    quirofanos: Optional[float] = None
    año: Optional[int] = None
    complejidad: Optional[int] = None
    indiceocupacional: Optional[float] = None
    indicerotacion: Optional[float] = None
    promediodiasestadia: Optional[float] = None
    letalidad: Optional[float] = None
    egresosfallecidos: Optional[float] = None
    region: Optional[str] = None

# Esquemas adicionales para respuestas específicas
class HospitalSummary(BaseModel):
    """Esquema resumido de Hospital para listas"""
    hospital_id: int
    hospital_name: str
    region_id: int
    complejidad: int
    año: int
    
    class Config:
        from_attributes = True

class HospitalStats(BaseModel):
    """Esquema para estadísticas de hospitales"""
    total_hospitales: int
    total_consultas: int
    promedio_complejidad: float
    años_disponibles: list[int]
