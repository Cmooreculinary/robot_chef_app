// Captain Culinary Kids — local-first persistence with optional backend sync.
// Source-of-truth lives in localStorage so the app works fully offline.

const KEY = "cck.state.v1";
const SESSION_KEY = "cck.sessionId.v1";

const DEFAULT_STATE = {
  ageGroup: null,
  completedLessons: [],
  earnedBadges: [],
  completedChallenges: [],
  foodTrucks: [],
  restaurants: [],
  settings: {
    soundOn: true,
    textSize: "regular", // "regular" | "large"
    parentReminders: true,
  },
};

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = "cck-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export const Storage = {
  getSessionId,
  getState: read,
  setAgeGroup(ageGroup) {
    const s = read();
    s.ageGroup = ageGroup;
    write(s);
  },
  completeLesson(lessonId, badgeId) {
    const s = read();
    if (!s.completedLessons.includes(lessonId)) s.completedLessons.push(lessonId);
    if (badgeId && !s.earnedBadges.includes(badgeId)) s.earnedBadges.push(badgeId);
    write(s);
    return s;
  },
  toggleChallenge(challengeId) {
    const s = read();
    const idx = s.completedChallenges.indexOf(challengeId);
    if (idx >= 0) s.completedChallenges.splice(idx, 1);
    else s.completedChallenges.push(challengeId);
    write(s);
    return s;
  },
  saveFoodTruck(concept) {
    const s = read();
    s.foodTrucks.unshift({ id: "ft-" + Date.now(), ...concept, createdAt: new Date().toISOString() });
    write(s);
    return s;
  },
  saveRestaurant(concept) {
    const s = read();
    s.restaurants.unshift({ id: "rs-" + Date.now(), ...concept, createdAt: new Date().toISOString() });
    write(s);
    return s;
  },
  updateSettings(patch) {
    const s = read();
    s.settings = { ...s.settings, ...patch };
    write(s);
    return s;
  },
  resetProgress() {
    const s = read();
    write({ ...DEFAULT_STATE, settings: s.settings, ageGroup: s.ageGroup });
  },
  awardBadge(badgeId) {
    const s = read();
    if (badgeId && !s.earnedBadges.includes(badgeId)) {
      s.earnedBadges.push(badgeId);
      write(s);
    }
    return s;
  },
};
