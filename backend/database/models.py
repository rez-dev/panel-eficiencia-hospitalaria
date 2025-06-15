from sqlalchemy import Column, Integer, String, Float, Numeric
from sqlalchemy.ext.declarative import declarative_base
from .database import Base # Importar Base desde el database.py local

# Si Base no se define en database.py o quieres una específica para modelos:
# Base = declarative_base()

class Hospital(Base):
    __tablename__ = "hospitals"

    hospital_id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer)
    hospital_name = Column(String, index=True)
    hospital_alternative_name = Column(String, nullable=True)
    latitud = Column(Float)
    longitud = Column(Float)
    consultas = Column(Integer)
    grdxegresos = Column(Float)
    bienesyservicios = Column(Integer)
    remuneraciones = Column(Integer)
    diascamadisponibles = Column(Integer)
    consultasurgencias = Column(Integer)
    examenes = Column(Float)
    quirofanos = Column(Float)
    año = Column(Integer)
    complejidad = Column(Integer)