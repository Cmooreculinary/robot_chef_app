# Captain Culinary Kids — Product Requirements Document

## Original problem statement
Build a polished, mobile-first, demo-ready app called **Captain Culinary Kids** — a premium children's and teen food-skills education app where Captain Culinary (a robot chef mentor with white chef hat, chrome faceplate, glowing blue eyes, and intentionally NO mouth) teaches through full-screen culinary illustration plates. The product should feel like a one-time-purchase phone app that families can own, revisit, print from, and grow with over years.

**Tagline**: Learn · Cook · Serve

## User personas
1. **Junior Chef (ages 7–12)** — Safety, simple food skills, family cooking, and service with adult guidance.
2. **Skill Builder (ages 13–16)** — Prep skills, healthy meals, global food learning, teamwork, confidence.
3. **Launch Path (ages 17–19)** — Life skills, food truck basics, restaurant thinking, hospitality, leadership.
4. **Parent / Teacher** — Curriculum overview, safety notes, supervision guidance, group-use ideas.

## Core requirements (static)
- **Captain Culinary** is the visible teacher — robot chef, no mouth, warmth conveyed through eyes/posture/voice.
- **Teaching plates** are the universal central element — vintage culinary illustration style.
- **Question-and-advance rhythm**: After each major teaching section, Captain asks "Would you like to move on, or do you have any questions?"
- **Safety standard** is non-negotiable: Adult supervision required for knives, heat, appliances, raw meat, cleaning chemicals (ages 7–12 especially).
- **Brief biblical/life connections** allowed but never preachy or forced.
- **One-time purchase model**: "Buy once. Learn for life."
- **No login required**; local-first (localStorage).
- **Future Gemma 4 / Google AI Studio integration** prepared via `generateCaptainResponse()` service — currently returns simulated responses.

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + Shadcn/UI components. Mobile-first with bottom nav (5 items: Home, Lessons, Missions, Progress, Parent).
- **Backend**: FastAPI + MongoDB. Sketch endpoints for lessons / badges / missions / progress / builders. Best-effort cloud sync; localStorage is source of truth.
- **Storage**: localStorage key `cck.state.v1`; anonymous sessionId at `cck.sessionId.v1`.
- **Captain coach**: `/app/frontend/src/services/captainCulinaryCoach.js#generateCaptainResponse()` — single integration point for future AI.

## Design system
- Palette: Cream `#FFF7EA`, Navy `#102A43`, Teal `#1C7C7D`, Coral `#F26A5B`, Gold `#F2B84B`, Soft Blue `#DDF3FF`.
- Fonts: **Fraunces** (display), **IM Fell English SC** (vintage plate titles), **Lora** (body), **Plus Jakarta Sans** (UI).
- Vintage culinary plate aesthetic: parchment background, decorative borders, ornamental dividers, SVG/CSS illustrations.

## What's been implemented (Feb 2026)
### Frontend pages (14)
- ✅ Welcome (`/`) — Captain hero, app name, tagline, CTAs, one-time purchase line
- ✅ Age Selection (`/age`) — 4 path cards with icons & descriptions
- ✅ Dashboard (`/dashboard`) — Greeting, mentor card, today's plate, progress strip, quick tiles
- ✅ Lesson Library (`/lessons`) — Filterable by age & difficulty, 7 lessons
- ✅ Live Teaching Plate (`/lesson/:id`) — Full vintage plate, Captain narration, 4 actions (Move On, Ask, Explain Again, Life Connection), Ask Captain panel with 5 quick prompts
- ✅ Quiz (`/quiz/:id`) — 3 multiple-choice questions, badge award on perfect score
- ✅ Progress & Badges (`/progress`) — 10 badges grid, progress %, recommended next
- ✅ Family Challenge (`/family`) — 6 missions, toggleable completion
- ✅ Global Food Mission (`/global`) — 6 mission cards with detail modal
- ✅ Food Truck Builder (`/food-truck`) — 10-field concept card, badge reward
- ✅ Restaurant Builder (`/restaurant`) — 10-field concept card, badge reward
- ✅ Parent / Teacher Info (`/parent`) — Curriculum overview, use cases, safety, purchase block
- ✅ Settings (`/settings`) — Age path, sound, text size, parent reminders, reset progress

### Teaching plates (7) — proprietary CSS/SVG vintage style
- ✅ Kitchen Safety Basics (5 habit cells)
- ✅ Mirepoix (full progression: Whole → Trimmed → Slice → Baton → Small Dice for onion/celery/carrot)
- ✅ Knife Cuts (Slice / Plank / Baton / Small Dice with illustrations)
- ✅ Build a Better Snack Plate (round plate composition with 4 quadrants)
- ✅ Rice Around the World (stylised world map with 7 region pins)
- ✅ Food Truck Concept (illustrated truck + 5-part concept structure)
- ✅ Restaurant Hospitality (illustrated storefront + 4 legs)

### Backend (FastAPI)
- ✅ GET /api/ — health
- ✅ GET /api/lessons + /api/lessons/{id}
- ✅ GET /api/badges, /api/missions/global, /api/missions/family
- ✅ GET/POST /api/progress/{sessionId} — anonymous progress sync
- ✅ POST/GET /api/builders/food-truck and /api/builders/restaurant

### Captain coach service
- ✅ `generateCaptainResponse()` with simulated lesson-aware responses
- ✅ Tone variation by age group (junior / skill / launch)
- ✅ Question types: biblical, safety, explain, why, what, open
- ✅ Documented future Gemma 4 / Google AI Studio integration point

## Test results (iteration 1)
- Backend: **100%** (12/12 pytest tests passing)
- Frontend: **95%** (preview-only z-index issue with rightmost nav items; fixed)
- All flows verified end-to-end on mobile viewport.

## Prioritized backlog
### P0 — none open

### P1 (next sprint)
- Wire Browser SpeechSynthesis for Captain voice narration (toggle in Settings.soundOn)
- Print/poster export of teaching plates (single page PDF)
- Stripe one-time purchase paywall (currently messaging-only)

### P2 (future)
- Live Gemma 4 / Google AI Studio integration via `generateCaptainResponse()`
- Real Captain Culinary illustration sets (replace SVG placeholders with hand-rendered art)
- Multi-learner profiles for classrooms / homes / ministries
- Optional cloud account (sync across devices) — currently anonymous-only
- ElevenLabs / OpenAI TTS for premium narration voice
- Offline PWA mode

## Next tasks list
1. Verify production deployment passes (no hardcoded URLs/keys)
2. Add SpeechSynthesis hook keyed off `settings.soundOn`
3. Begin Stripe checkout for one-time unlock (test key already in pod env)
