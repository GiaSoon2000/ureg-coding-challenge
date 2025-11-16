# backend/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from datetime import date as _date, datetime
import os

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app)

# DB config - SQLite file in backend folder
base_dir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(base_dir, "forex.db")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + db_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Models
class Currency(db.Model):
    __tablename__ = "currencies"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(3), nullable=False)
    name = db.Column(db.String(100), nullable=False)

class Rate(db.Model):
    __tablename__ = "rates"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    base_currency_id = db.Column(db.Integer, nullable=False)
    target_currency_id = db.Column(db.Integer, nullable=False)
    rate = db.Column(db.Numeric(18,6), nullable=False)
    effective_date = db.Column(db.Date, nullable=False)

# Helper to format results
def get_rates_by_date(date=None):
    # Accept either a date object or an ISO date string (YYYY-MM-DD)
    if date:
        # if it's already a date object, use it; if string, parse to date
        if isinstance(date, _date):
            date_filter = date
        else:
            try:
                # datetime.fromisoformat can parse YYYY-MM-DD
                date_filter = datetime.fromisoformat(date).date()
            except Exception:
                raise ValueError("date must be in YYYY-MM-DD format")
    else:
        latest = db.session.query(func.max(Rate.effective_date)).scalar()
        date_filter = latest

    rows = db.session.query(Rate, Currency).join(
        Currency, Currency.id == Rate.target_currency_id
    ).filter(
        Rate.base_currency_id == 1,
        Rate.effective_date == date_filter
    ).order_by(Currency.code).all()

    rates = []
    for rate_row, currency in rows:
        rates.append({
            "currency": currency.code,
            "name": currency.name,
            "rate": float(rate_row.rate)
        })
    return {"date": str(date_filter), "rates": rates}

@app.route("/rates", methods=["GET"])
def rates():
    date = request.args.get("date")  # YYYY-MM-DD
    try:
        result = get_rates_by_date(date)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve frontend static (when built)
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # If production build exists in ../frontend/dist, serve it
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        index_path = os.path.join(app.static_folder, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({"message":"Frontend not built"}), 404

if __name__ == "__main__":
    # If DB not exists, remind to run seed.py
    if not os.path.exists(db_path):
        print("Database forex.db not found. Run `python seed.py` to create and seed DB.")
    app.run(host="0.0.0.0", port=5000, debug=True)
