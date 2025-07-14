import os
import sys
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv

# Base declarativa (se puede usar sin conexión a DB)
Base = declarative_base()
metadata = MetaData()

# Variables globales para la configuración (se inicializan después)
engine = None
SessionLocal = None
DATABASE_URL = None

def load_database_config(test_mode=False, database_url=None):
    """
    Carga la configuración de la base de datos.
    
    Args:
        test_mode (bool): Si es True, usa configuración para tests
        database_url (str): URL personalizada de base de datos (opcional)
    """
    global engine, SessionLocal, DATABASE_URL
    
    if database_url:
        # URL personalizada (útil para tests)
        DATABASE_URL = database_url
    elif test_mode:
        # Configuración para tests (base de datos en memoria)
        DATABASE_URL = "sqlite:///:memory:?check_same_thread=false"
    else:
        # Configuración normal desde variables de entorno
        if not os.getenv("POSTGRES_USER"):
            load_dotenv()
        
        POSTGRES_USER = os.getenv("POSTGRES_USER")
        POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
        POSTGRES_HOST = os.getenv("POSTGRES_HOST")
        POSTGRES_PORT = os.getenv("POSTGRES_PORT")
        POSTGRES_DB = os.getenv("POSTGRES_DB")
        
        DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    # Crear engine y SessionLocal
    if DATABASE_URL.startswith("sqlite"):
        # Configuración específica para SQLite
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
    else:
        # Configuración para PostgreSQL
        engine = create_engine(DATABASE_URL)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_database_url():
    """Retorna la URL de la base de datos actual."""
    return DATABASE_URL

def create_tables():
    """Crea todas las tablas en la base de datos."""
    if engine is None:
        raise RuntimeError("Database not configured. Call load_database_config() first.")
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Elimina todas las tablas de la base de datos (útil para tests)."""
    if engine is None:
        raise RuntimeError("Database not configured. Call load_database_config() first.")
    Base.metadata.drop_all(bind=engine)

# Dependency para obtener la sesión de la base de datos
def get_db():
    """
    Dependency de FastAPI para obtener una sesión de base de datos.
    """
    if SessionLocal is None:
        raise RuntimeError("Database not configured. Call load_database_config() first.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Inicializar automáticamente en modo producción (no en tests)
# Verificamos múltiples formas de detectar que estamos en pytest
is_pytest = any([
    "PYTEST_CURRENT_TEST" in os.environ,
    "pytest" in os.environ.get("_", ""),
    any("pytest" in arg for arg in sys.argv),
    hasattr(sys, '_pytest_config')
])

if not is_pytest:
    load_database_config()
