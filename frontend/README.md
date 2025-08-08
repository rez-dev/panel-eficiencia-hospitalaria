# Frontend (Vite + React)

Interfaz del Panel de Eficiencia Hospitalaria. Consume la API del backend y visualiza indicadores y análisis.

## Requisitos
- Node.js 18+

## Scripts
```bash
npm run dev      # desarrollo
npm run build    # compilación
npm run preview  # previsualización de build
npm run lint     # linting
```

## Configuración
- Variable: `VITE_APP_BACKEND_ADDRESS` (URL del backend, p.ej. `http://localhost:8000`).
  - Puedes definirla en `frontend/.env` o como variable de entorno al ejecutar.

## Ejecutar en local
```bash
npm install
# Define la URL del backend
# echo VITE_APP_BACKEND_ADDRESS=http://localhost:8000 > .env
npm run dev
```

## Estructura
- `src/components/`: vistas y componentes del panel
- `src/services/api.js`: cliente para consumir la API (`VITE_APP_BACKEND_ADDRESS`)
- `src/contexts/`: estado global

## Buenas prácticas
- Mantén `VITE_APP_BACKEND_ADDRESS` coherente con el `CORS_ORIGINS` del backend.
- Reutiliza `ApiService` para llamadas a endpoints.
