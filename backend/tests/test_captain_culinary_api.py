"""Captain Culinary Kids — Backend API tests.

Covers:
  - Health
  - Lessons (list / detail)
  - Badges
  - Missions (global / family)
  - Progress (POST + GET roundtrip)
  - Builders (food-truck / restaurant) — POST then GET
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fall back to frontend/.env if available
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def session_id():
    return f"TEST_{uuid.uuid4()}"


# --- Health ---------------------------------------------------------------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data["app"] == "Captain Culinary Kids"
        assert data["status"] == "ok"


# --- Lessons --------------------------------------------------------------
class TestLessons:
    def test_list_lessons(self, client):
        r = client.get(f"{API}/lessons")
        assert r.status_code == 200
        data = r.json()
        assert data["count"] == 7
        assert len(data["items"]) == 7
        required = {"id", "title", "ageGroup", "path", "badge", "plateKey"}
        for item in data["items"]:
            assert required.issubset(item.keys()), f"missing keys in {item}"

    def test_get_lesson_mirepoix(self, client):
        r = client.get(f"{API}/lessons/mirepoix")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == "mirepoix"
        assert data["plateKey"] == "mirepoix"
        assert data["ageGroup"] == "13-16"

    def test_get_lesson_not_found(self, client):
        r = client.get(f"{API}/lessons/does-not-exist")
        assert r.status_code == 404

    def test_filter_by_age(self, client):
        r = client.get(f"{API}/lessons", params={"ageGroup": "13-16"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) >= 1
        for item in items:
            assert item["ageGroup"] == "13-16"


# --- Badges --------------------------------------------------------------
class TestBadges:
    def test_list_badges(self, client):
        r = client.get(f"{API}/badges")
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 10
        ids = {b["id"] for b in items}
        for expected in {"safety-starter", "prep-pro", "food-truck-rookie", "restaurant-builder"}:
            assert expected in ids


# --- Missions ------------------------------------------------------------
class TestMissions:
    def test_global(self, client):
        r = client.get(f"{API}/missions/global")
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 6
        ids = {m["id"] for m in items}
        assert "rice" in ids and "bread" in ids

    def test_family(self, client):
        r = client.get(f"{API}/missions/family")
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 6
        for item in items:
            assert "title" in item and "prompt" in item


# --- Progress ------------------------------------------------------------
class TestProgress:
    def test_get_empty_progress(self, client, session_id):
        r = client.get(f"{API}/progress/{session_id}")
        assert r.status_code == 200
        data = r.json()
        assert data["sessionId"] == session_id
        assert data["completedLessons"] == []

    def test_save_and_read_progress(self, client, session_id):
        payload = {
            "sessionId": session_id,
            "ageGroup": "13-16",
            "completedLessons": ["mirepoix"],
            "earnedBadges": ["prep-pro"],
            "completedChallenges": ["fc-1"],
            "settings": {"sound": True, "textSize": "Regular"},
        }
        r = client.post(f"{API}/progress/{session_id}", json=payload)
        assert r.status_code == 200
        assert r.json()["ok"] is True

        # GET back
        r2 = client.get(f"{API}/progress/{session_id}")
        assert r2.status_code == 200
        data = r2.json()
        assert data["sessionId"] == session_id
        assert data["ageGroup"] == "13-16"
        assert "mirepoix" in data["completedLessons"]
        assert "prep-pro" in data["earnedBadges"]
        assert data["settings"]["sound"] is True


# --- Builders: Food Truck -----------------------------------------------
class TestFoodTruckBuilder:
    def test_save_and_list(self, client, session_id):
        payload = {
            "sessionId": session_id,
            "truckName": "TEST_Truck",
            "foodIdea": "Tacos for kids",
            "menu1": "Veggie taco",
            "menu2": "Chicken taco",
            "menu3": "Bean bowl",
            "targetCustomer": "Families",
            "brandStyle": "Bright + friendly",
            "safetyNote": "Allergy menu",
            "costThought": "$5 per item",
            "serviceMission": "Feed the neighborhood",
        }
        r = client.post(f"{API}/builders/food-truck", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["truckName"] == "TEST_Truck"
        assert "id" in data
        assert "createdAt" in data

        r2 = client.get(f"{API}/builders/food-truck/{session_id}")
        assert r2.status_code == 200
        items = r2.json()["items"]
        assert any(it.get("truckName") == "TEST_Truck" for it in items)


# --- Builders: Restaurant -----------------------------------------------
class TestRestaurantBuilder:
    def test_save_and_list(self, client, session_id):
        payload = {
            "sessionId": session_id,
            "restaurantName": "TEST_Restaurant",
            "concept": "Family hospitality",
            "hospitalityPromise": "Greet every guest",
            "menuIdea1": "Soup",
            "menuIdea2": "Sandwich",
            "menuIdea3": "Salad",
            "teamRoles": "Host / Cook / Server",
            "cleanlinessPlan": "Clean every hour",
            "guestExperience": "Warm welcome",
            "communityPurpose": "Serve neighbors",
        }
        r = client.post(f"{API}/builders/restaurant", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["restaurantName"] == "TEST_Restaurant"
        assert "id" in data

        r2 = client.get(f"{API}/builders/restaurant/{session_id}")
        assert r2.status_code == 200
        items = r2.json()["items"]
        assert any(it.get("restaurantName") == "TEST_Restaurant" for it in items)
