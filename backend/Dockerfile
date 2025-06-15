FROM python:3.11-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de requisitos e instalarlos
# Copiar primero para aprovechar el cache de Docker si los requisitos no cambian
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . /app

# Exponer el puerto en el que Uvicorn se ejecutará dentro del contenedor
EXPOSE 8000

# Comando para ejecutar la aplicación
# Asegúrate de que 'main:app' coincida con tu archivo y nombre de instancia de FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
