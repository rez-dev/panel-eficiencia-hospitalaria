from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import load_database_config, create_tables
from database import models
import logging
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Panel Eficiencia Hospitalaria API", version="1.0.0")

# Obtener orígenes CORS desde variables de entorno
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in cors_origins.split(',')]

# Configurar CORS para permitir comunicación con el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar y registrar las rutas
from routes import app as routes_app
app.include_router(routes_app)

# Evento de startup para inicializar la base de datos
@app.on_event("startup")
async def startup_event():
    """Inicializar base de datos al iniciar la aplicación."""
    create_tables()

if __name__ == "__main__":
    import uvicorn
    # Obtener configuración del servidor desde variables de entorno
    host = os.getenv("SERVER_HOST", "0.0.0.0")  # 0.0.0.0 para permitir conexiones externas
    port = int(os.getenv("BACKEND_PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    uvicorn.run("main:app", host=host, port=port, reload=reload)
