# backend/seed.py
from server import app, db, Currency, Rate
from datetime import date
import os

def seed():
    with app.app_context():
        # Ensure the database is seeded with initial data
        # Here we force drop/create to ensure consistency (for dev use). If you want to preserve data, comment out drop_all.
        if os.path.exists(os.path.join(os.path.dirname(__file__), "forex.db")):
            # If you don't want to recreate the database each time, you can check if any currencies exist
            existing = db.session.query(Currency).first()
            if existing:
                print("Database already seeded — skipping.")
                return

        db.drop_all()
        db.create_all()

        currencies = [
            (1, 'USD', 'US Dollar'),
            (2, 'EUR', 'Euro'),
            (3, 'GBP', 'British Pound'),
            (4, 'JPY', 'Japanese Yen'),
            (5, 'AUD', 'Australian Dollar'),
            (6, 'MYR', 'Malaysian Ringgit'),
            (7, 'CNY', 'Chinese Yuan'),
            (8, 'SGD', 'Singapore Dollar'),
            (9, 'KRW', 'South Korean Won'),
            (10, 'NZD', 'New Zealand Dollar'),
            (11, 'CAD', 'Canadian Dollar'),
            (12, 'HKD', 'Hong Kong Dollar'),
            (13, 'PHP', 'Philippine Peso'),
        ]

        for cid, code, name in currencies:
            db.session.add(Currency(id=cid, code=code, name=name))

        today = date.today()
        historical_date = date(2023, 7, 1)

        rates_today = [
            (1,2,0.85), (1,3,0.73), (1,4,110.25), (1,5,1.35),
            (1,6,4.50), (1,7,6.45), (1,8,1.35), (1,9,1180.00),
            (1,10,1.42), (1,11,1.25), (1,12,7.78), (1,13,50.12)
        ]
        rates_hist = [
            (1,2,0.81), (1,3,0.68), (1,4,109.31), (1,5,1.25),
            (1,6,4.40), (1,7,6.25), (1,8,1.30)
        ]

        for base, target, r in rates_today:
            db.session.add(Rate(base_currency_id=base, target_currency_id=target, rate=r, effective_date=today))
        for base, target, r in rates_hist:
            db.session.add(Rate(base_currency_id=base, target_currency_id=target, rate=r, effective_date=historical_date))

        db.session.commit()
        print("Seeded DB with currencies and rates.")

if __name__ == "__main__":
    seed()
