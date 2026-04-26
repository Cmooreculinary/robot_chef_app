// Captain Culinary Coach Service
// =============================================================
// generateCaptainResponse() — single entry point for Captain's
// teaching voice. Today it returns simulated responses derived
// from local lesson data. Tomorrow this is where the live
// teaching model attaches.
//
// FUTURE INTEGRATION POINT:
//   Google AI Studio / Gemma 4 connects HERE. The app will
//   continue to control navigation, lesson order, quiz logic,
//   badges, parent safety notes, and progress tracking. The AI
//   layer is only allowed to *generate or personalize* Captain's
//   teaching text inside this approved structure.
// =============================================================

import { getLessonById, ASK_PROMPTS } from "@/data/lessons";

/**
 * @param {Object} input
 * @param {string} input.ageGroup            "7-12" | "13-16" | "17-19" | "parent"
 * @param {string} input.lessonTitle
 * @param {string} input.lessonPath
 * @param {string} input.currentTeachingPlate  plateKey
 * @param {string} input.lessonStep            step id ("today-skill" | "plate-walk" | ...)
 * @param {string} input.userQuestion          free text or one of ASK_PROMPTS
 * @param {string} input.safetyLevel
 * @param {boolean} input.allowBiblicalConnection
 */
export function generateCaptainResponse(input) {
  const {
    ageGroup,
    lessonStep,
    userQuestion,
    allowBiblicalConnection,
  } = input || {};

  const lesson = input?.lessonId ? getLessonById(input.lessonId) : null;

  if (userQuestion) {
    return answerQuestion(userQuestion, lesson, ageGroup, allowBiblicalConnection);
  }

  if (lesson && lessonStep) {
    const step = lesson.steps.find((s) => s.id === lessonStep);
    if (step) {
      return {
        kind: "teaching",
        text: step.body,
        followUp: "Would you like to move on, or do you have any questions?",
      };
    }
  }

  if (lesson) {
    return {
      kind: "welcome",
      text: lesson.welcome,
      followUp: "Would you like to begin, or do you have any questions?",
    };
  }

  return {
    kind: "greeting",
    text: "I'm Captain Culinary, your chef mentor. Choose a path and I will guide you through every plate.",
    followUp: null,
  };
}

function answerQuestion(question, lesson, ageGroup, allowBiblical) {
  const q = question.trim().toLowerCase();

  if (lesson) {
    if (q.includes("biblical") || q.includes("life lesson")) {
      const text = lesson.biblical || "Good kitchens are built on order, care, and service. When we prepare food well, we are practicing a small kind of service.";
      return {
        kind: "biblical",
        text,
        followUp: "Would you like to move on, or do you have any questions?",
      };
    }
    if (q.includes("safe") || q.includes("danger") || q.includes("hurt")) {
      return {
        kind: "safety",
        text: tonedFor(ageGroup, [
          "Safety first, always. Wash your hands, clear the counter, and ask your trusted adult for help with knives, heat, appliances, raw meat, or cleaning chemicals.",
          "Safety before speed. Stable board, sharp blade, bear-claw hand, and an adult supervising any heat or cutting work.",
          "Safety scales with skill. As you grow, you take on more responsibility — and more responsibility for others around you.",
        ]),
        followUp: "Would you like to keep going, or do you have another question?",
      };
    }
    if (q.includes("explain") || q.includes("again")) {
      const lastStep = lesson.steps[lesson.steps.length - 1];
      return {
        kind: "explain",
        text: `Of course. ${lastStep.body}`,
        followUp: "Would you like to move on, or do you have any questions?",
      };
    }
    if (q.includes("why")) {
      const why = lesson.steps.find((s) => s.id === "why-matters");
      return {
        kind: "why",
        text: why ? why.body : "Because every step in the kitchen has a purpose — flavor, safety, or service.",
        followUp: "Would you like to keep going, or do you have another question?",
      };
    }
    if (q.includes("what") || q.includes("mean")) {
      const skill = lesson.steps.find((s) => s.id === "today-skill");
      return {
        kind: "definition",
        text: skill ? skill.body : "This part of the lesson teaches a foundation skill you will use again and again.",
        followUp: "Would you like to keep going, or do you have another question?",
      };
    }
  }

  // generic fallback
  return {
    kind: "open",
    text: tonedFor(ageGroup, [
      "Great question, young chef. Let us slow down and look together — every part of cooking has a reason.",
      "Good question. Let us reason through it like a careful prep cook: what do we know, and what do we want to make true?",
      "Good question. The best chefs ask first, cut second. Let us think through it.",
    ]),
    followUp: "Would you like to keep going, or do you have another question?",
  };
}

function tonedFor(ageGroup, [junior, skill, launch]) {
  if (ageGroup === "13-16") return skill;
  if (ageGroup === "17-19") return launch;
  return junior;
}

export const COMMON_ASK_PROMPTS = ASK_PROMPTS;
