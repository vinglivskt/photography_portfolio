def test_health(api_client):
    r = api_client.get("/api/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_health_ready(api_client):
    r = api_client.get("/api/health/ready")
    assert r.status_code == 200
    assert r.json().get("status") == "ready"


def test_settings_ok(api_client):
    r = api_client.get("/api/settings")
    assert r.status_code == 200
    data = r.json()
    assert "photographer_name" in data


def test_collections_pagination(api_client):
    r = api_client.get("/api/collections?page=1&per_page=6")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "pages" in data


def test_services_list(api_client):
    r = api_client.get("/api/services")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_feedback_validation(api_client):
    r = api_client.post("/api/feedback", json={})
    assert r.status_code == 422


def test_feedback_create(api_client):
    r = api_client.post(
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


def test_blog_post_not_found(api_client):
    r = api_client.get("/api/blog/999999")
    assert r.status_code == 404


def test_settings_has_social_and_author_fields(api_client):
    r = api_client.get("/api/settings")
    assert r.status_code == 200
    data = r.json()
    assert "author_images" in data
    assert isinstance(data["author_images"], list)
    assert "public_short_name" in data
    assert "hero_subtitle" in data


def test_services_include_booking_url(api_client):
    r = api_client.get("/api/services")
    assert r.status_code == 200
    data = r.json()
    if data:
        assert "booking_url" in data[0]
