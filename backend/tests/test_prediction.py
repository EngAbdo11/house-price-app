import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    # Using TestClient as a context manager triggers the FastAPI lifespan
    # (startup/shutdown), which is what actually loads the model.
    with TestClient(app) as c:
        yield c


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_happy_path(client):
    payload = {
        "location": "other",
        "carpet_area_sqft": 1200,
        "floor_num": 3,
        "bathroom": 2,
        "balcony": 1,
        "furnishing": "Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert body["predicted_price"] > 0


def test_predict_invalid_input(client):
    # Missing required fields -> FastAPI/pydantic validation error
    payload = {"location": "other"}
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
