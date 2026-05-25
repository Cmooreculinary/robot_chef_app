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
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import sqlite3
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# SQLite Database path setup
DB_PATH = Path(__file__).parent / "culinary_chef.db"

def init_db():
    """Creates the database tables automatically if they don't exist yet."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table for progress sync
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            sessionId TEXT PRIMARY KEY,
            ageGroup TEXT,
            completedLessons TEXT,
            earnedBadges TEXT,
            completedChallenges TEXT,
            settings TEXT,
            updatedAt TEXT
        )
    """)
    
    # Table for food truck builders
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS food_trucks (
            id TEXT PRIMARY KEY,
            sessionId TEXT,
            truckName TEXT,
            foodIdea TEXT,
            menu1 TEXT,
            menu2 TEXT,
            menu3 TEXT,
            targetCustomer TEXT,
            brandStyle TEXT,
            safetyNote TEXT,
            costThought TEXT,
            serviceMission TEXT,
            createdAt TEXT
        )
    """)
    
    # Table for restaurant builders
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS restaurants (
            id TEXT PRIMARY KEY,
            sessionId TEXT,
            restaurantName TEXT,
            concept TEXT,
            hospitalityPromise TEXT,
            menuIdea1 TEXT,
            menuIdea2 TEXT,
            menuIdea3 TEXT,
            teamRoles TEXT,
            cleanlinessPlan TEXT,
            guestExperience TEXT,
            communityPurpose TEXT,
            createdAt TEXT
        )
    """)
    conn.commit()
    conn.close()

# Initialize the tables immediately on launch
init_db()

app = FastAPI(title="Captain Culinary Kids API")
api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------------------------
# Static curriculum content (mirrors front-end /src/data/lessons.js)
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
    {"id": "fc-2", "title": "Colorful Snack Plate", "prompt": "