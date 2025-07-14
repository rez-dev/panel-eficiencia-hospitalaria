"""
Configuración global para pytest.
Este archivo se ejecuta automáticamente por pytest y define fixtures compartidas.
"""
import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import Base, load_database_config, drop_tables, create_tables, get_db, get_database_url


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """
    Fixture que se ejecuta automáticamente al inicio de la sesión de tests.
    Configura el entorno de testing.
    """
    # Marcar que estamos en modo test antes de cualquier importación
    original_value = os.environ.get("PYTEST_CURRENT_TEST")
    os.environ["PYTEST_CURRENT_TEST"] = "true"
    
    # Configurar la base de datos para tests
    load_database_config(test_mode=True)
    
    yield
    
    # Restaurar el valor original o eliminar si no existía
    if original_value is None:
        os.environ.pop("PYTEST_CURRENT_TEST", None)
    else:
        os.environ["PYTEST_CURRENT_TEST"] = original_value


@pytest.fixture(scope="function")
def test_db():
    """
    Fixture que proporciona una sesión de base de datos limpia para cada test.
    Configurada para funcionar con SQLite y evitar problemas de threading.
    """
    # Asegurar que tenemos la configuración de test
    if get_database_url() != "sqlite:///:memory:?check_same_thread=false":
        load_database_config(test_mode=True)
    
    # Obtener el engine después de la configuración
    from database.database import engine
    
    # Configurar SQLite para que funcione en múltiples threads
    if engine.url.drivername == "sqlite":
        from sqlalchemy import event
        
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            # Configurar SQLite para threading
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
    
    # Crear todas las tablas
    create_tables()
    
    # Crear una sesión para el test
    TestingSessionLocal = sessionmaker(
        autocommit=False, 
        autoflush=False, 
        bind=engine,
        # Configuración específica para SQLite en tests
        expire_on_commit=False
    )
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Limpiar las tablas después del test
        drop_tables()


@pytest.fixture(scope="function")
def test_app():
    """
    Fixture que crea una aplicación FastAPI para testing.
    No ejecuta los eventos de startup automáticamente.
    """
    app = FastAPI(title="Panel Eficiencia Hospitalaria API - Test", version="1.0.0")
    
    # Configurar CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Importar y registrar las rutas
    from routes import app as routes_app
    app.include_router(routes_app)
    
    return app


@pytest.fixture(scope="function")
def client(test_db, test_app):
    """
    Fixture que proporciona un cliente de prueba para FastAPI.
    Sobrescribe la dependencia get_db para usar la misma base de datos del test.
    """
    def override_get_db():
        # Crear una nueva sesión con el mismo engine que test_db
        from database.database import engine
        TestingSessionLocal = sessionmaker(
            autocommit=False, 
            autoflush=False, 
            bind=engine,
            expire_on_commit=False
        )
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()
    
    test_app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(test_app) as test_client:
        yield test_client
    
    # Limpiar las sobrescrituras de dependencias
    test_app.dependency_overrides.clear()
