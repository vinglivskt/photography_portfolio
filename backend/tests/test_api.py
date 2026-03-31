from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app) as client:
        r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_health_ready():
    with TestClient(app) as client:
        r = client.get("/api/health/ready")
    assert r.status_code == 200
    assert r.json().get("status") == "ready"


def test_settings_ok():
    with TestClient(app) as client:
        r = client.get("/api/settings")
    assert r.status_code == 200
    data = r.json()
    assert "photographer_name" in data


def test_collections_pagination():
    with TestClient(app) as client:
        r = client.get("/api/collections?page=1&per_page=6")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "pages" in data


def test_services_list():
    with TestClient(app) as client:
        r = client.get("/api/services")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_feedback_validation():
    with TestClient(app) as client:
        r = client.post("/api/feedback", json={})
    assert r.status_code == 422


def test_feedback_create():
    with TestClient(app) as client:
        r = client.post(
            "/api/feedback",
            json={
                "subject": "Тест",
                "email": "test@example.com",
                "content": "Текст сообщения",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data["subject"] == "Тест"
    assert data["email"] == "test@example.com"
    assert "id" in data
