#!/bin/sh
# backend/entrypoint.sh
set -e

DB_FILE="/app/forex.db"

# If DB file missing or empty, run seed
if [ ! -f "$DB_FILE" ]; then
    echo "DB file not found — running seed.py"
    python seed.py
else
    # optional: check if currencies exist; if not, seed
    python - <<PY
from server import app, db, Currency
with app.app_context():
    if db.session.query(Currency).first() is None:
        print("DB found but empty — seeding")
        import seed; seed.seed()
    else:
        print("DB already seeded. Skipping seeding.")
PY
fi

# Start server
exec python server.py
