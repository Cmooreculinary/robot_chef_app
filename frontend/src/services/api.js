// Thin axios wrapper. Backend is optional — UI works without it.
import axios from "axios";
import { Storage } from "./storage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, timeout: 8000 });

export const Api = {
  async health() {
    const r = await client.get("/");
    return r.data;
  },
  async listLessons(params = {}) {
    const r = await client.get("/lessons", { params });
    return r.data.items;
  },
  async listBadges() {
    const r = await client.get("/badges");
    return r.data.items;
  },
  async listGlobalMissions() {
    const r = await client.get("/missions/global");
    return r.data.items;
  },
  async listFamilyChallenges() {
    const r = await client.get("/missions/family");
    return r.data.items;
  },
  async syncProgress() {
    const sid = Storage.getSessionId();
    const s = Storage.getState();
    try {
      await client.post(`/progress/${sid}`, {
        sessionId: sid,
        ageGroup: s.ageGroup || undefined,
        completedLessons: s.completedLessons,
        earnedBadges: s.earnedBadges,
        completedChallenges: s.completedChallenges,
        settings: s.settings,
      });
      return true;
    } catch {
      return false; // silent — local state still good
    }
  },
  async saveFoodTruck(concept) {
    try {
      const r = await client.post("/builders/food-truck", {
        sessionId: Storage.getSessionId(),
        ...concept,
      });
      return r.data;
    } catch {
      return null;
    }
  },
  async saveRestaurant(concept) {
    try {
      const r = await client.post("/builders/restaurant", {
        sessionId: Storage.getSessionId(),
        ...concept,
      });
      return r.data;
    } catch {
      return null;
    }
  },
};
