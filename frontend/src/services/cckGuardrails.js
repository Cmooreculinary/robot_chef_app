// ============================================================
// Captain Culinary Kids — Master AI + Safety Build Book Guardrails
// ============================================================
// Deterministic routing + risk classification used by Live Test Mode.
// No network calls. No AI. Pure rule-based classifier so the routing
// behavior itself can be audited and reviewed.
//
// Priority order (first match wins):
//   1. EMERGENCY_STOP   - any danger, injury, medical, fire, choking
//   2. DEVOTIONAL_LAYER - faith / grief / prayer / spiritual distress
//   3. KITCHEN_SAFETY   - knives, heat, chemicals, allergens
//   4. SANITATION       - hand washing, cleaning, germs
//   5. FOOD_SKILLS      - cooking, prep, recipes, ingredients
//   6. RANDOM_BUT_SAFE  - fallback (anything else)
//
// Every classification returns a full envelope that the UI
// displays verbatim. Nothing is hidden from the operator.
// ============================================================

export const RISK = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

export const ADULT = {
  NO: "NO",
  MAYBE: "MAYBE",
  YES: "YES",
};

// Display metadata for each route
export const ROUTE_META = {
  FOOD_SKILLS: {
    label: "FOOD_SKILLS",
    color: "var(--cck-gold-deep)",
    tone: "gold",
    defaultRisk: RISK.MEDIUM,
    defaultAdult: ADULT.MAYBE,
    description: "Cooking, prep, recipes, ingredients, meal planning.",
  },
  SANITATION: {
    label: "SANITATION",
    color: "var(--cck-teal)",
    tone: "teal",
    defaultRisk: RISK.LOW,
    defaultAdult: ADULT.NO,
    description: "Hand washing, cleaning, germs, safe surfaces.",
  },
  KITCHEN_SAFETY: {
    label: "KITCHEN_SAFETY",
    color: "var(--cck-coral-deep)",
    tone: "coral",
    defaultRisk: RISK.HIGH,
    defaultAdult: ADULT.YES,
    description: "Knives, heat, appliances, raw meat, cleaning chemicals.",
  },
  EMERGENCY_STOP: {
    label: "EMERGENCY_STOP",
    color: "#B00020",
    tone: "critical",
    defaultRisk: RISK.CRITICAL,
    defaultAdult: ADULT.YES,
    safetyStop: true,
    description: "Danger detected — adult + emergency services flow.",
  },
  DEVOTIONAL_LAYER: {
    label: "DEVOTIONAL_LAYER",
    color: "var(--cck-gold-deep)",
    tone: "gold",
    defaultRisk: RISK.MEDIUM,
    defaultAdult: ADULT.NO,
    routing: "approved devotional corpus only",
    description: "Sensitive faith moments — routed only through reviewed corpus.",
  },
  RANDOM_BUT_SAFE: {
    label: "RANDOM_BUT_SAFE",
    color: "var(--cck-navy)",
    tone: "navy",
    defaultRisk: RISK.LOW,
    defaultAdult: ADULT.NO,
    description: "Out-of-scope but benign — redirect back to lesson scope.",
  },
};

// Keyword banks (lowercase, whole-or-partial word matches)
// Keywords must be specific enough to avoid false positives on common English.
// EMERGENCY_STOP in particular biases toward multi-word / domain phrases
// because a single misroute here triggers the Safety Stop banner.
const KEYWORDS = {
  EMERGENCY_STOP: [
    "911", "emergency", "ambulance", "call poison",
    "bleed", "bleeding", " blood",
    "cut myself", "cut my finger", "cut my hand", "cut my arm", "deep cut",
    "on fire", "house fire", "kitchen fire", "pan is on fire", "oven fire",
    "i burned myself", "got burned", "bad burn", "burning me",
    "choke", "choking", "can't breathe", "cant breathe",
    "allergic reaction", "anaphyla", "swelling up",
    "seizure", "passed out", "unconscious", "fainted",
    "poisoned", "swallowed something", "overdose", "ate poison",
    "help me", "hurt bad", "badly hurt", "serious injury",
    "to the hospital", "going to hospital", "in pain",
  ],
  DEVOTIONAL_LAYER: [
    "pray", "prayer", " god ", "jesus", "christ", "the lord",
    "scripture", "bible", "bible verse", "faith", "heaven",
    "church", "pastor", "ministry", "worship",
    "grief", "grieving", " loss ", "died", "death", "mourn",
    "spiritual", "devotion", "blessing",
    "afraid", "lonely", "abandoned",
  ],
  KITCHEN_SAFETY: [
    "knife", "knives", "sharp", "blade",
    "stove", "oven", "burner", "flame", "heat ", "hot pan", "boiling",
    "appliance", "mixer", "blender", "microwave",
    "raw meat", "raw chicken", "raw beef", "raw egg",
    "bleach", "cleaner", "chemical", "ammonia",
    "allergy", "peanut", "gluten", "dairy",
    "smoke alarm", "safety",
  ],
  SANITATION: [
    "wash hands", "hand wash", "handwash",
    "soap", "sanitize", "sanitizer",
    "germ", "bacteria", "virus",
    "clean counter", "wipe", "dirty", "dishwash",
  ],
  FOOD_SKILLS: [
    "cook", "cooking", "recipe", " prep ", "prepare",
    "slice", "dice", "chop", "mince", "julienne", "baton",
    "bake", "fry", "boil", "simmer", "roast", "grill",
    "mix", "whisk", "stir", "fold",
    "ingredient", "meal", "snack", "breakfast", "lunch", "dinner",
    "mirepoix", "onion", "carrot", "celery", "garlic",
    "flour", "sugar", "butter", " oil ", "salt",
    "knife cut", "food truck", "restaurant", "menu",
  ],
};

const SCRIPTED_RESPONSES = {
  FOOD_SKILLS:
    "Food skills noted. In Live Mode, Captain returns to approved lesson content. Sharp tools and heat always require a trusted adult present.",
  SANITATION:
    "Sanitation step identified. Wash hands for twenty seconds, clear the counter, use safe tools. Small habits, daily practice.",
  KITCHEN_SAFETY:
    "Kitchen safety context detected. Knives, heat, appliances, raw meat, and cleaning chemicals all require adult supervision — no exceptions.",
  EMERGENCY_STOP:
    "SAFETY STOP. Stop what you are doing, get a trusted adult immediately, and call emergency services if anyone is hurt. Captain does not provide medical guidance.",
  DEVOTIONAL_LAYER:
    "Sensitive faith moment detected. This routes only through the approved devotional corpus — reviewed with the ministry partner in advance. No open internet responses.",
  RANDOM_BUT_SAFE:
    "That is outside the lesson scope. Captain is a culinary mentor. Let's return to food skills, sanitation, or safety.",
};

/**
 * Classify a single utterance against the CCK guardrail rules.
 * Returns a full envelope with route, risk, adult requirement,
 * safety stop flag, matched keywords, and scripted Captain response.
 *
 * @param {string} text - Raw transcript text (final or interim)
 * @returns {Object}
 */
export function classifyUtterance(text) {
  const normalized = (text || "").toLowerCase().trim();
  const ts = new Date().toISOString();

  if (!normalized) {
    return empty(ts);
  }

  // Priority-ordered matching
  const order = [
    "EMERGENCY_STOP",
    "DEVOTIONAL_LAYER",
    "KITCHEN_SAFETY",
    "SANITATION",
    "FOOD_SKILLS",
  ];

  for (const key of order) {
    const matched = KEYWORDS[key].filter((kw) => normalized.includes(kw));
    if (matched.length > 0) {
      const meta = ROUTE_META[key];
      return {
        timestamp: ts,
        utterance: text,
        route: key,
        risk: meta.defaultRisk,
        adultRequired: meta.defaultAdult,
        safetyStop: !!meta.safetyStop,
        matchedKeywords: matched,
        response: SCRIPTED_RESPONSES[key],
        routing: meta.routing || null,
      };
    }
  }

  // Fallback
  const meta = ROUTE_META.RANDOM_BUT_SAFE;
  return {
    timestamp: ts,
    utterance: text,
    route: "RANDOM_BUT_SAFE",
    risk: meta.defaultRisk,
    adultRequired: meta.defaultAdult,
    safetyStop: false,
    matchedKeywords: [],
    response: SCRIPTED_RESPONSES.RANDOM_BUT_SAFE,
    routing: null,
  };
}

function empty(ts) {
  return {
    timestamp: ts,
    utterance: "",
    route: null,
    risk: null,
    adultRequired: null,
    safetyStop: false,
    matchedKeywords: [],
    response: null,
    routing: null,
  };
}

export const ALL_ROUTES = Object.keys(ROUTE_META);
