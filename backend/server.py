"""
Captain Culinary Kids — Backend API
Sketch backend that supports the front-end prototype today
and is ready to grow into a multi-user education platform.

Endpoints:
  GET  /api/                       Health check
  GET  /api/lessons                List all lessons (filterable by path/age)
  GET  /api/lessons/{lesson_id}    Single lesson detail
  GET  /api/badges                 Catalog of badges
  GET  /api/missions/global        Global Food Mission cards
  GET  /api/missions/family        Family challenge prompts
  GET  /api/progress/{session_id}  Read learner progress (anonymous session)
  POST /api/progress/{session_id}  Persist progress (lessons / badges / settings)
  POST /api/builders/food-truck    Save Food Truck Concept Card
  GET  /api/builders/food-truck/{session_id}
  POST /api/builders/restaurant    Save Restaurant Concept Card
  GET  /api/builders/restaurant/{session_id}

This file is intentionally minimal: localStorage holds the source-of-truth
on the front-end while the backend acts as a gentle cloud sync layer.
"""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Captain Culinary Kids API")
api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------------------------
# Static curriculum content (mirrors front-end /src/data/lessons.js so either
# layer can be the source of truth during demo). In production the front-end
# fetches these to enable cloud-driven curriculum updates.
# ---------------------------------------------------------------------------

LESSONS: List[Dict[str, Any]] = [
    {
        "id": "kitchen-safety-basics",
        "title": "Kitchen Safety Basics",
        "ageGroup": "7-12",
        "path": "Kitchen Safety",
        "time": "8 minutes",
        "difficulty": "Beginner",
        "safetyLevel": "Adult Supervision",
        "badge": "safety-starter",
        "summary": "Hand washing, clear counters, safe tools, and the no-touch zones every young chef must know.",
        "plateKey": "kitchen-safety",
    },
    {
        "id": "mirepoix",
        "title": "Mirepoix: From Vegetable to Small Dice",
        "ageGroup": "13-16",
        "path": "Knife Skills & Prep",
        "time": "15 minutes",
        "difficulty": "Intermediate",
        "safetyLevel": "Supervised Skill",
        "badge": "prep-pro",
        "summary": "The classic aromatic foundation — onion, celery, carrot — from whole vegetable to small dice.",
        "plateKey": "mirepoix",
    },
    {
        "id": "knife-cuts",
        "title": "Knife Cuts & Prep",
        "ageGroup": "13-16",
        "path": "Knife Skills & Prep",
        "time": "12 minutes",
        "difficulty": "Intermediate",
        "safetyLevel": "Supervised Skill",
        "badge": "prep-pro",
        "summary": "Slice, plank, baton, dice — a calm, controlled progression of cuts every prep cook learns.",
        "plateKey": "knife-cuts",
    },
    {
        "id": "snack-plate",
        "title": "Build a Better Snack Plate",
        "ageGroup": "7-12",
        "path": "Healthy Meals",
        "time": "10 minutes",
        "difficulty": "Beginner",
        "safetyLevel": "Adult Supervision",
        "badge": "family-meal-helper",
        "summary": "Color, balance, allergy awareness — a snack plate that nourishes and looks beautiful.",
        "plateKey": "snack-plate",
    },
    {
        "id": "rice-around-world",
        "title": "Global Food Mission: Rice Around the World",
        "ageGroup": "13-16",
        "path": "Global Cuisines",
        "time": "12 minutes",
        "difficulty": "Beginner",
        "safetyLevel": "Discussion + Supervised Cooking",
        "badge": "global-food-explorer",
        "summary": "How a single grain feeds families on every continent — and what each tradition can teach us.",
        "plateKey": "rice-world",
    },
    {
        "id": "food-truck-builder",
        "title": "Food Truck Concept Builder",
        "ageGroup": "17-19",
        "path": "Food Truck Builder",
        "time": "20 minutes",
        "difficulty": "Advanced",
        "safetyLevel": "Business Learning",
        "badge": "food-truck-rookie",
        "summary": "Name, idea, three menu items, target customer, and a service mission for your community.",
        "plateKey": "food-truck",
    },
    {
        "id": "restaurant-hospitality",
        "title": "Restaurant Hospitality Basics",
        "ageGroup": "17-19",
        "path": "Restaurant Builder",
        "time": "18 minutes",
        "difficulty": "Advanced",
        "safetyLevel": "Business Learning",
        "badge": "restaurant-builder",
        "summary": "Hospitality, team roles, cleanliness, and a one-page concept that serves a real community need.",
        "plateKey": "restaurant",
    },
]

BADGES: List[Dict[str, Any]] = [
    {"id": "safety-starter", "name": "Safety Starter", "icon": "shield-check"},
    {"id": "clean-hands-champion", "name": "Clean Hands Champion", "icon": "droplets"},
    {"id": "prep-pro", "name": "Prep Pro", "icon": "knife"},
    {"id": "family-meal-helper", "name": "Family Meal Helper", "icon": "utensils"},
    {"id": "global-food-explorer", "name": "Global Food Explorer", "icon": "globe"},
    {"id": "service-chef", "name": "Service Chef", "icon": "heart-handshake"},
    {"id": "food-truck-rookie", "name": "Food Truck Rookie", "icon": "truck"},
    {"id": "restaurant-builder", "name": "Restaurant Builder", "icon": "store"},
    {"id": "captains-apprentice", "name": "Captain's Apprentice", "icon": "compass"},
    {"id": "mission-leader", "name": "Mission Leader", "icon": "flag"},
]

GLOBAL_MISSIONS: List[Dict[str, Any]] = [
    {"id": "rice", "title": "Rice Around the World", "region": "Global"},
    {"id": "bread", "title": "Bread Around the World", "region": "Global"},
    {"id": "soup-stew", "title": "Soup and Stew Traditions", "region": "Global"},
    {"id": "tropical-fruits", "title": "Fruits of the Tropics", "region": "Equatorial"},
    {"id": "spices", "title": "Spices and Smells", "region": "Global"},
    {"id": "family-meals", "title": "Family Meals Across Cultures", "region": "Global"},
]

FAMILY_CHALLENGES: List[Dict[str, Any]] = [
    {"id": "fc-1", "title": "Three Safety Zones", "prompt": "Help an adult check the kitchen for three safety zones: clean hands, clear counter, safe tools."},
    {"id": "fc-2", "title": "Colorful Snack Plate", "prompt": "Build a colorful snack plate with an adult — fruit, protein, grain, water."},
    {"id": "fc-3", "title": "Set The Table", "prompt": "Help set the table tonight and explain one safety rule you learned."},
    {"id": "fc-4", "title": "Family Memory Meal", "prompt": "Ask a family member about a favorite meal from childhood. Take notes."},
    {"id": "fc-5", "title": "Plan One Dinner", "prompt": "Help plan one dinner this week. Choose simple, balanced foods."},
    {"id": "fc-6", "title": "Serve Someone", "prompt": "Serve a neighbor, church group, school group, or family member with a small food gift."},
]


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ProgressDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")

    sessionId: str
    ageGroup: Optional[str] = None
    completedLessons: List[str] = Field(default_factory=list)
    earnedBadges: List[str] = Field(default_factory=list)
    completedChallenges: List[str] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FoodTruckConcept(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    truckName: str
    foodIdea: str
    menu1: str
    menu2: str
    menu3: str
    targetCustomer: str
    brandStyle: str
    safetyNote: str
    costThought: str
    serviceMission: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RestaurantConcept(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    restaurantName: str
    concept: str
    hospitalityPromise: str
    menuIdea1: str
    menuIdea2: str
    menuIdea3: str
    teamRoles: str
    cleanlinessPlan: str
    guestExperience: str
    communityPurpose: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@api_router.get("/")
async def root():
    return {"app": "Captain Culinary Kids", "status": "ok", "version": "1.0.0"}


@api_router.get("/lessons")
async def list_lessons(ageGroup: Optional[str] = None, path: Optional[str] = None):
    items = LESSONS
    if ageGroup:
        items = [item for item in items if item["ageGroup"] == ageGroup]
    if path:
        items = [item for item in items if item["path"] == path]
    return {"items": items, "count": len(items)}


@api_router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    for item in LESSONS:
        if item["id"] == lesson_id:
            return item
    raise HTTPException(status_code=404, detail="Lesson not found")


@api_router.get("/badges")
async def list_badges():
    return {"items": BADGES}


@api_router.get("/missions/global")
async def list_global_missions():
    return {"items": GLOBAL_MISSIONS}


@api_router.get("/missions/family")
async def list_family_challenges():
    return {"items": FAMILY_CHALLENGES}


@api_router.get("/progress/{session_id}")
async def get_progress(session_id: str):
    doc = await db.progress.find_one({"sessionId": session_id}, {"_id": 0})
    if not doc:
        return ProgressDoc(sessionId=session_id).model_dump()
    if isinstance(doc.get("updatedAt"), str):
        doc["updatedAt"] = datetime.fromisoformat(doc["updatedAt"])
    return doc


@api_router.post("/progress/{session_id}")
async def save_progress(session_id: str, payload: ProgressDoc):
    payload.sessionId = session_id
    payload.updatedAt = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["updatedAt"] = doc["updatedAt"].isoformat()
    await db.progress.update_one(
        {"sessionId": session_id},
        {"$set": doc},
        upsert=True,
    )
    return {"ok": True, "sessionId": session_id}


@api_router.post("/builders/food-truck", response_model=FoodTruckConcept)
async def save_food_truck(payload: FoodTruckConcept):
    doc = payload.model_dump()
    doc["createdAt"] = doc["createdAt"].isoformat()
    await db.food_trucks.insert_one(doc)
    return payload


@api_router.get("/builders/food-truck/{session_id}")
async def list_food_trucks(session_id: str):
    items = await db.food_trucks.find({"sessionId": session_id}, {"_id": 0}).to_list(100)
    for it in items:
        if isinstance(it.get("createdAt"), str):
            it["createdAt"] = datetime.fromisoformat(it["createdAt"])
    return {"items": items}


@api_router.post("/builders/restaurant", response_model=RestaurantConcept)
async def save_restaurant(payload: RestaurantConcept):
    doc = payload.model_dump()
    doc["createdAt"] = doc["createdAt"].isoformat()
    await db.restaurants.insert_one(doc)
    return payload


@api_router.get("/builders/restaurant/{session_id}")
async def list_restaurants(session_id: str):
    items = await db.restaurants.find({"sessionId": session_id}, {"_id": 0}).to_list(100)
    for it in items:
        if isinstance(it.get("createdAt"), str):
            it["createdAt"] = datetime.fromisoformat(it["createdAt"])
    return {"items": items}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
