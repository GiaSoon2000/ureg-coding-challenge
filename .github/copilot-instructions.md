**Repository Overview**

This is a small full-stack app (Flask backend + React/Vite frontend) implementing a simple exchange-rates viewer.
- Backend: `backend/` — Flask app (`server.py`), SQLite database `forex.db`, seeding logic in `seed.py`, Dockerfile and `entrypoint.sh` for container startup.
- Frontend: `frontend/` — React + Vite app (pages under `src/`), lazy-loading UI at `src/pages/RatesPage.jsx`, small API wrapper at `src/api.js`.
- Orchestration: `docker-compose.yml` builds both services; frontend is served by nginx in production image.

**Big-picture architecture & dataflow**

- Client (browser) → Frontend (`RatesPage.jsx`) calls API via `src/api.js` to `/rates`.
- Backend (`server.py`) exposes `GET /rates?date=YYYY-MM-DD` which returns the latest or historical rates from SQLite (`backend/forex.db`).
- DB seed/creation: `backend/seed.py` creates `currencies` and `rates` tables and inserts sample rows. `entrypoint.sh` seeds the DB when container first starts.

**Key files to inspect when changing behavior**

- `backend/server.py` — API endpoint logic, SQLAlchemy models, static-file serving (serves built frontend from `../frontend/dist`).
- `backend/seed.py` — how currencies and rates are created (used by `entrypoint.sh`).
- `backend/Dockerfile` and `backend/entrypoint.sh` — container image and startup behavior (seed-if-missing then run server).
- `frontend/src/pages/RatesPage.jsx` — UI: date picker, fetch logic, and lazy-loading implementation (PAGE_SIZE = 12). Modify here for UI changes.
- `frontend/src/api.js` — axios instance; currently uses a relative `baseURL` (empty string) so runtime origin is used.
- `frontend/src/api.js` — axios instance; currently uses a relative `baseURL` (empty string) so runtime origin is used. The production `frontend` image includes an nginx proxy (`frontend/nginx/default.conf`) that forwards `/rates` to the `backend` service and exposes a `/health` endpoint. See `frontend/Dockerfile` for the container `HEALTHCHECK`.
- `docker-compose.yml` — dev-friendly volume mount for `./backend:/app`. This means local backend edits reflect inside the container.

**Developer workflows (how to run & test locally)**

- Run backend locally (venv):
  - Windows PowerShell:
    ```powershell
    cd backend
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python seed.py    # create forex.db (optional — entrypoint also seeds)
    python server.py
    ```
  - Server listens on `0.0.0.0:5000`; `GET /rates` returns JSON.

- Run frontend locally (Vite dev):
  - From `frontend/`:
    ```powershell
    npm install
    npm run dev
    ```
  - Vite dev server uses a different port (default 5173). The frontend's `API` uses a relative baseURL; during dev you may need a proxy in `vite.config.js` or run the frontend on same origin as backend (or call full backend URL `http://localhost:5000`).

- Run both with Docker Compose (recommended to reproduce production build):
  - From repo root:
    ```powershell
    docker-compose up --build
    ```
  - Backend: `http://localhost:5000`; Frontend (nginx) served at `http://localhost:3000` (docker-compose maps container port 80 → host 3000).

**Project-specific conventions and gotchas**

- API stability: `server.py` expects `date` query param formatted as `YYYY-MM-DD`. If omitted, it uses the latest `effective_date`.
- DB location: `forex.db` lives in `backend/` (and is mounted into the container at `/app/forex.db` via `docker-compose` volume). Be careful when removing the file locally — container entrypoint will re-seed.
- Static serving: The backend tries to serve the production frontend from `../frontend/dist`. If you change build output directory, update `app = Flask(..., static_folder=...)` accordingly.
- Frontend axios baseURL is empty string; the app relies on same-origin or explicit proxying. For dev testing, either enable a proxy in `vite.config.js` or use absolute URLs in `src/api.js`.

**Examples of common edits**

- Add a new endpoint (e.g., POST `/currency`):
  - Update SQLAlchemy models in `server.py` (or factor models into `models.py`), add endpoint handler, then add optional DB migration/seed logic in `seed.py` for local dev.
- Extend rates data model to include source/currency precision:
  - Modify `Rate` model in `server.py` and update `schema.sql`/`seed.py` accordingly; for small projects using SQLite, a re-seed is simplest for dev.

**Security & production notes (discoverable in code)**

- No authentication — this is an open read-only API by design for the challenge.
- The container `backend` uses `FLASK_ENV=production` in `docker-compose.yml` but `server.py` runs with `debug=True` when invoked directly. For production-like behavior, start with `gunicorn` or set `debug=False`.
- Avoid shipping `forex.db` with sensitive data — it's a local sample DB for this repo.

**Tests / stretch features**

- The frontend already includes a lazy-loading implementation in `RatesPage.jsx`. Pagination PAGE_SIZE is `12` — to change behavior, edit that constant.
- There are no unit tests in the repo. If you add tests, place backend tests under `backend/tests/` and frontend tests under `frontend/__tests__/` and update README with commands.

**Quick pointers for an AI contributor**

- To find API logic: open `backend/server.py` (search for `@app.route("/rates")`).
- To adjust DB seed data: edit `backend/seed.py` (currencies and rates are added here). Seed is idempotent when run via `entrypoint.sh`.
- To change build/deploy ports: check `docker-compose.yml` and both `Dockerfile`s.

If anything here is unclear or you'd like me to include additional example snippets (e.g., a minimal test, a `Makefile` or a `gunicorn` startup), tell me what you prefer and I'll iterate.
