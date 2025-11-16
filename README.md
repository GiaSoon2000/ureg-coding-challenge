# U-Reg Coding Challenge — Exchange Rates Viewer

This repository is a small full-stack application (Flask backend + React/Vite frontend) that displays latest and historical exchange rates.

Contents
- `backend/` — Flask API, SQLite `forex.db`, seed script and tests.
- `frontend/` — React + Vite SPA, built assets served by nginx in Docker.
- `docker-compose.yml` — builds and runs both services for local production-like testing.

Gist used for DB schema/seed:
https://gist.github.com/ureg-tech/e4168553bb7d3f0f8ef23c23917dc0b0

## Quick start (Windows PowerShell)

### 1) Run backend locally (venv)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# create and seed DB (optional — entrypoint will seed in docker)
python seed.py
# run server
python server.py
```

### 2) Run frontend locally (Vite dev)
```powershell
cd frontend
npm install
npm run dev
```

Notes: the dev server uses a different port (Vite default 5173). If you run the frontend dev server, configure a proxy in `vite.config.js` or set `frontend/src/api.js` to call `http://localhost:5000` during development.

## Run both with Docker Compose (production-like)
```powershell
cd "D:\Self Project\ureg-coding-challenge"
docker compose up --build
```
- Frontend: http://localhost:3000 (nginx)
- Backend API: http://localhost:5000 (Flask)

Notes about the production build & proxy
- The frontend image includes an nginx config (`frontend/nginx/default.conf`) that proxies `/rates` to the backend service on the Docker network (`backend:5000`). This allows the SPA to use relative API paths (e.g. `/rates`).
- The frontend container includes a `HEALTHCHECK` that queries `/health`.

## Seeding & database
- The DB file `backend/forex.db` is created/seeded by `backend/seed.py` (also called automatically by `backend/entrypoint.sh` when the container starts and the DB is missing).
- For dev you can run `python seed.py` to recreate/populate the DB.

## Tests (backend)
1. Activate venv (see above) and install requirements
2. Run pytest from `backend/`:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m pytest -q
```

## Build production artifacts
- Frontend build is created during the frontend image build (`npm run build` runs inside the Dockerfile). To build locally before creating an image:
```powershell
cd frontend
npm run build
# built files appear in frontend/dist
```

## API Documentation

### GET /rates

Fetch exchange rates for a specific date or the latest rates.

**Query Parameters:**
- `date` (optional, string): Date in `YYYY-MM-DD` format. If omitted, returns the latest available rates.

**Response:**
- Status: `200 OK`
- Content-Type: `application/json`

**Example 1: Get latest rates**
```bash
curl http://localhost:5000/rates
```

Response:
```json
{
  "date": "2025-11-15",
  "rates": [
    {
      "currency": "AUD",
      "name": "Australian Dollar",
      "rate": 1.35
    },
    {
      "currency": "CAD",
      "name": "Canadian Dollar",
      "rate": 1.25
    }
  ]
}
```

**Example 2: Get historical rates**
```bash
curl "http://localhost:5000/rates?date=2023-07-01"
```

Response:
```json
{
  "date": "2023-07-01",
  "rates": [
    {
      "currency": "EUR",
      "name": "Euro",
      "rate": 0.81
    }
  ]
}
```

**Example 3: Invalid date (gracefully returns empty rates)**
```bash
curl "http://localhost:5000/rates?date=invalid-date"
```

Response:
```json
{
  "date": "invalid-date",
  "rates": []
}
```

**Notes:**
- All rates are relative to USD (base_currency_id = 1).
- If no rates exist for a requested date, an empty `rates` array is returned.
- The API always returns HTTP 200; invalid dates are handled gracefully.
