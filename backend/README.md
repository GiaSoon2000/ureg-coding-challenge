# Backend (Flask + SQLite)

## Setup (Windows / macOS / Linux)

1. Create venv
   - Windows:
     python -m venv venv
     venv\Scripts\activate
   - macOS/Linux:
     python3 -m venv venv
     source venv/bin/activate

2. Install
   pip install -r requirements.txt

3. Create SQLite DB from schema.sql
   - If you have sqlite3 CLI:
       sqlite3 forex.db < schema.sql
     (run this command inside the backend folder)
   - Or use DB browser for SQLite to run schema.sql

4. Run server
   export FLASK_APP=app.py   (or set FLASK_APP on Windows)
   flask run --host=0.0.0.0 --port=5000
   OR
   python server.py

## Tests (pytest)

1. From the `backend/` folder run:

```powershell
pip install -r requirements.txt
python -m pytest -q
```

The test suite will call `seed.seed()` to ensure the DB has sample data.

## Docker / Compose notes

- `docker-compose.yml` builds `backend` and mounts `./backend:/app`. That mount means local edits are visible inside the container (good for dev) but also will override files from the image.
- The backend serves static files from `../frontend/dist` if present — in production, the frontend is served by the `frontend` service (nginx). To preview the full stack locally use `docker-compose up --build` from the repo root.

