import pytest
from server import app
import seed


@pytest.fixture(scope="module")
def client():
    # Ensure DB is seeded for tests
    with app.app_context():
        seed.seed()
    with app.test_client() as c:
        yield c


def test_latest_rates(client):
    rv = client.get("/rates")
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, dict)
    assert "rates" in data and isinstance(data["rates"], list)
    assert data.get("date") is not None


def test_historical_rates(client):
    rv = client.get("/rates?date=2023-07-01")
    assert rv.status_code == 200
    data = rv.get_json()
    assert data.get("date", "").startswith("2023-07-01")
    assert len(data.get("rates", [])) > 0
