// Captain Culinary Kids — local lesson curriculum.
// Each lesson is a structured walkthrough with steps, quiz, family challenge,
// optional biblical/life connection, and a teaching plate component key.

export const AGE_PATHS = [
  {
    id: "7-12",
    title: "Junior Chef Path",
    ageLabel: "Ages 7 – 12",
    description:
      "Safety, simple food skills, family cooking, and service with adult guidance.",
    badge: "safety-starter",
    accent: "teal",
  },
  {
    id: "13-16",
    title: "Skill Builder Path",
    ageLabel: "Ages 13 – 16",
    description:
      "Prep skills, healthy meals, global food learning, teamwork, and confidence.",
    badge: "prep-pro",
    accent: "coral",
  },
  {
    id: "17-19",
    title: "Launch Path",
    ageLabel: "Ages 17 – 19",
    description:
      "Advanced life skills, food truck basics, restaurant thinking, hospitality, and leadership.",
    badge: "captains-apprentice",
    accent: "gold",
  },
  {
    id: "parent",
    title: "Parent / Teacher Mode",
    ageLabel: "For Adults",
    description:
      "Curriculum overview, safety notes, supervision guidance, and group-use ideas.",
    badge: null,
    accent: "navy",
  },
];

export const BADGES = [
  { id: "safety-starter", name: "Safety Starter", icon: "ShieldCheck", color: "teal" },
  { id: "clean-hands-champion", name: "Clean Hands Champion", icon: "Droplets", color: "blue" },
  { id: "prep-pro", name: "Prep Pro", icon: "ChefHat", color: "coral" },
  { id: "family-meal-helper", name: "Family Meal Helper", icon: "Utensils", color: "gold" },
  { id: "global-food-explorer", name: "Global Food Explorer", icon: "Globe2", color: "teal" },
  { id: "service-chef", name: "Service Chef", icon: "HeartHandshake", color: "coral" },
  { id: "food-truck-rookie", name: "Food Truck Rookie", icon: "Truck", color: "gold" },
  { id: "restaurant-builder", name: "Restaurant Builder", icon: "Store", color: "navy" },
  { id: "captains-apprentice", name: "Captain's Apprentice", icon: "Compass", color: "teal" },
  { id: "mission-leader", name: "Mission Leader", icon: "Flag", color: "coral" },
];

export const LESSONS = [
  {
    id: "kitchen-safety-basics",
    title: "Kitchen Safety Basics",
    ageGroup: "7-12",
    path: "Kitchen Safety",
    time: "8 minutes",
    difficulty: "Beginner",
    safetyLevel: "Adult Supervision",
    badge: "safety-starter",
    plateKey: "kitchen-safety",
    accent: "teal",
    summary:
      "Hand washing, clear counters, safe tools, and the no-touch zones every young chef must know.",
    welcome:
      "Welcome, young chef. Before we cook, we learn how to keep ourselves, our family, and our kitchen safe.",
    steps: [
      {
        id: "today-skill",
        title: "Today's Skill",
        body: "We will learn five safety habits that turn any kitchen into a calm and ready place to cook: clean hands, clear counter, safe tools, allergy awareness, and the trusted adult helper.",
      },
      {
        id: "why-matters",
        title: "Why It Matters",
        body: "A safe kitchen is a kind kitchen. When we cook safely, we protect ourselves and the people we love. Every great chef in the world begins here.",
      },
      {
        id: "safety-check",
        title: "Safety Check",
        body: "Find your trusted adult. Wash your hands. Clear the counter. Check for allergies. Do not touch knives, heat, appliances, raw meat, or cleaning chemicals without adult help.",
      },
      {
        id: "plate-walk",
        title: "Teaching Plate Walkthrough",
        body: "Look at the plate together. Each illustration shows a habit: bubbles for clean hands, a clear board for the counter, a covered knife for safe tools, a heart for allergy care, and an adult helper standing close by.",
      },
      {
        id: "practice",
        title: "Student Practice",
        body: "Stand at your kitchen. Point to where you wash your hands, where the counter is clearest, and where the trusted adult will help. Naming these zones helps you remember them.",
      },
    ],
    quiz: [
      { q: "Should you use a sharp knife alone?", choices: ["Yes", "No", "Only at night"], answer: 1 },
      { q: "What should you do before touching food?", choices: ["Pet the cat", "Wash your hands", "Turn on the oven"], answer: 1 },
      { q: "Who should help with heat or appliances?", choices: ["A friend your age", "Nobody", "A trusted adult"], answer: 2 },
    ],
    biblical:
      "A safe kitchen is a place of wisdom and care. When we prepare carefully, we are showing love for the people we serve.",
    familyChallenge:
      "Help an adult check the kitchen for three safety zones: clean hands, clear counter, and safe tools.",
  },

  {
    id: "mirepoix",
    title: "Mirepoix: From Vegetable to Small Dice",
    ageGroup: "13-16",
    path: "Knife Skills & Prep",
    time: "15 minutes",
    difficulty: "Intermediate",
    safetyLevel: "Supervised Skill",
    badge: "prep-pro",
    plateKey: "mirepoix",
    accent: "coral",
    summary:
      "The classic aromatic foundation — onion, celery, carrot — from whole vegetable to small dice.",
    welcome:
      "Welcome, young chef. This plate shows one of the most important foundations in cooking: mirepoix. We begin with whole vegetables, then trim them, cut them into safe shapes, and finally prepare a small dice. The goal is not speed. The goal is control, safety, and even pieces.",
    steps: [
      {
        id: "today-skill",
        title: "Today's Skill",
        body: "Mirepoix is a 2 / 1 / 1 mix of onion, celery, and carrot — the calm, fragrant base of soups, sauces, and stews around the world.",
      },
      {
        id: "why-matters",
        title: "Why It Matters",
        body: "When pieces are even, they cook evenly. Even pieces create even flavor. Mirepoix is your training in calm, controlled prep.",
      },
      {
        id: "safety-check",
        title: "Safety Note",
        body: "For younger chefs, this is a look-and-learn lesson unless a trusted adult is helping. Knives require supervision, a stable cutting board, and the bear-claw hand position.",
      },
      {
        id: "plate-walk",
        title: "Teaching Plate Walkthrough",
        body: "Read the plate left to right: WHOLE → TRIMMED → SLICES / PLANKS → BATONS / STRIPS → SMALL DICE. Notice how each row shows the same control — calm hands, even pieces.",
      },
      {
        id: "practice",
        title: "Student Practice",
        body: "With your trusted adult, lay one carrot, one celery rib, and half an onion on the board. Trace each stage with your finger before any blade touches food.",
      },
    ],
    quiz: [
      { q: "What is the classic mirepoix ratio?", choices: ["1 / 1 / 1", "2 / 1 / 1 (onion / celery / carrot)", "3 / 2 / 1"], answer: 1 },
      { q: "Why do we want even pieces?", choices: ["They look pretty", "They cook evenly and taste even", "They are easier to count"], answer: 1 },
      { q: "What is the safest hand position when slicing?", choices: ["Open palm", "Bear claw with fingertips tucked", "Pinch grip"], answer: 1 },
    ],
    biblical:
      "Preparation matters. In the kitchen, we prepare ingredients before we cook. In life, wisdom often means preparing before we act. Good preparation helps us serve others with calm and care.",
    familyChallenge:
      "With an adult, build one batch of mirepoix and use it as the base of a simple soup or rice dish.",
  },

  {
    id: "knife-cuts",
    title: "Knife Cuts & Prep",
    ageGroup: "13-16",
    path: "Knife Skills & Prep",
    time: "12 minutes",
    difficulty: "Intermediate",
    safetyLevel: "Supervised Skill",
    badge: "prep-pro",
    plateKey: "knife-cuts",
    accent: "navy",
    summary:
      "Slice, plank, baton, dice — a calm, controlled progression of cuts every prep cook learns.",
    welcome:
      "Welcome back, chef. This plate is your map of the four foundational cuts: SLICE, PLANK, BATON, and DICE. Each cut prepares an ingredient to behave a certain way in a recipe.",
    steps: [
      { id: "today-skill", title: "Today's Skill", body: "Recognize and name the four foundation cuts and what each one is used for." },
      { id: "why-matters", title: "Why It Matters", body: "The cut decides how the food cooks, looks, and feels in the mouth. Good cuts make a good dish." },
      { id: "safety-check", title: "Safety Note", body: "Stable board on a damp towel. Sharp knife is safer than dull. Bear claw hand. Adult supervision required." },
      { id: "plate-walk", title: "Teaching Plate Walkthrough", body: "Read the plate top to bottom — each row shows the same vegetable transformed into the next cut: SLICE, PLANK, BATON, SMALL DICE." },
      { id: "practice", title: "Student Practice", body: "Point to each cut on the plate and say its name out loud. Then with your adult, practice one cut on a soft vegetable like a cucumber." },
    ],
    quiz: [
      { q: "Which cut is a long, thin rectangle?", choices: ["Slice", "Plank", "Baton", "Dice"], answer: 2 },
      { q: "Which cut is the smallest, most uniform cube?", choices: ["Slice", "Plank", "Small dice", "Baton"], answer: 2 },
      { q: "Why is a sharp knife safer?", choices: ["It cuts faster", "It needs less force and slips less", "It looks nicer"], answer: 1 },
    ],
    biblical:
      "Skill grows with patience. We do not chase speed — we practice steady, careful work, and mastery follows.",
    familyChallenge: "With an adult, prepare one ingredient three different ways: slice, baton, and small dice.",
  },

  {
    id: "snack-plate",
    title: "Build a Better Snack Plate",
    ageGroup: "7-12",
    path: "Healthy Meals",
    time: "10 minutes",
    difficulty: "Beginner",
    safetyLevel: "Adult Supervision",
    badge: "family-meal-helper",
    plateKey: "snack-plate",
    accent: "gold",
    summary:
      "Color, balance, allergy awareness — a snack plate that nourishes and looks beautiful.",
    welcome:
      "Welcome, young chef. Today we build a snack plate that is colorful, balanced, and kind to everyone who eats it.",
    steps: [
      { id: "today-skill", title: "Today's Skill", body: "Choose four building blocks: a fruit, a protein, a whole grain or simple starch, and water." },
      { id: "why-matters", title: "Why It Matters", body: "Balanced snacks give steady energy. Colorful plates feed the eyes and teach us to enjoy variety." },
      { id: "safety-check", title: "Safety Check", body: "Always ask about allergies — nuts, dairy, eggs, gluten, shellfish. A safe snack is one everyone at the table can enjoy." },
      { id: "plate-walk", title: "Teaching Plate Walkthrough", body: "Look at each section: bright fruit, a small protein, a whole grain, and a glass of water. The heart icon reminds us to ask about allergies first." },
      { id: "practice", title: "Student Practice", body: "Point to one item from each section that you could put on your snack plate today." },
    ],
    quiz: [
      { q: "What is the first thing to ask before sharing a snack?", choices: ["Is it cold?", "Are there any allergies?", "Did you wash it?"], answer: 1 },
      { q: "Which makes a balanced snack?", choices: ["Only candy", "Fruit + protein + grain + water", "Just chips"], answer: 1 },
      { q: "Why do we choose colorful foods?", choices: ["They look pretty only", "Color usually means more nutrients and variety", "Color makes them taste sweet"], answer: 1 },
    ],
    biblical:
      "Sharing food is one of the oldest ways we show love. A small, careful plate can be a great gift to someone tired or hungry.",
    familyChallenge: "Build a colorful snack plate with an adult and serve it to one family member.",
  },

  {
    id: "rice-around-world",
    title: "Global Food Mission: Rice Around the World",
    ageGroup: "13-16",
    path: "Global Cuisines",
    time: "12 minutes",
    difficulty: "Beginner",
    safetyLevel: "Discussion + Supervised Cooking",
    badge: "global-food-explorer",
    plateKey: "rice-world",
    accent: "teal",
    summary:
      "How a single grain feeds families on every continent — and what each tradition can teach us.",
    welcome:
      "Welcome, explorer. Today we travel without leaving the kitchen. Rice grows on six continents and feeds more than half of the world. Let us listen to what each tradition teaches us.",
    steps: [
      { id: "today-skill", title: "Today's Skill", body: "Recognize three different rice traditions and what makes each one special." },
      { id: "why-matters", title: "Why It Matters", body: "Food teaches respect. When we learn how a family in a different country cooks rice, we learn a small piece of who they are." },
      { id: "safety-check", title: "Safety Note", body: "Cooking rice uses heat. An adult helps with the pot, the lid, and the steam." },
      { id: "plate-walk", title: "Teaching Plate Walkthrough", body: "Read each region on the map: jasmine in Thailand, basmati in India, arborio in Italy, paella rice in Spain, jollof rice in West Africa, sushi rice in Japan, beans-and-rice across the Americas." },
      { id: "practice", title: "Student Practice", body: "Choose one region. Talk with an adult about one rice dish from that place — its flavor, its smell, the people who share it." },
    ],
    quiz: [
      { q: "Roughly how much of the world relies on rice?", choices: ["A small group", "More than half", "Only Asia"], answer: 1 },
      { q: "Which short, sticky rice is famous in Italian risotto?", choices: ["Basmati", "Arborio", "Jasmine"], answer: 1 },
      { q: "Why is global food respect important?", choices: ["It is just polite", "It honors people and their stories", "It is required by law"], answer: 1 },
    ],
    biblical:
      "Hospitality often begins with grain. Bread and rice have welcomed travelers for thousands of years. When we cook for someone different from us, we practice quiet kindness.",
    familyChallenge: "Ask your family about a rice dish they know or would like to try together this week.",
  },

  {
    id: "food-truck-builder",
    title: "Food Truck Concept Builder",
    ageGroup: "17-19",
    path: "Food Truck Builder",
    time: "20 minutes",
    difficulty: "Advanced",
    safetyLevel: "Business Learning",
    badge: "food-truck-rookie",
    plateKey: "food-truck",
    accent: "coral",
    summary:
      "Name, idea, three menu items, target customer, and a service mission for your community.",
    welcome:
      "Welcome, young entrepreneur. A food truck is a small kitchen with a big purpose. Today we sketch a concept that is honest, simple, and serves your community.",
    steps: [
      { id: "today-skill", title: "Today's Skill", body: "Translate a food idea into a clear, focused, customer-loving concept." },
      { id: "why-matters", title: "Why It Matters", body: "A focused concept is easier to run, easier to brand, and easier to love. Most great trucks do one thing very well." },
      { id: "safety-check", title: "Safety Note", body: "Real food trucks need permits, food safety training, hand-wash stations, and proper storage. Today we learn the thinking — adults handle the legal steps." },
      { id: "plate-walk", title: "Teaching Plate Walkthrough", body: "The plate shows the parts of a concept: NAME • IDEA • MENU • CUSTOMER • SERVICE. Each one supports the others." },
      { id: "practice", title: "Student Practice", body: "Open the Food Truck Builder and fill in each card. Keep it simple. Pick one community you would love to serve." },
    ],
    quiz: [
      { q: "What is a strong sign of a great food truck?", choices: ["A huge menu", "One thing done really well", "Loud music"], answer: 1 },
      { q: "Which is a real-world requirement?", choices: ["Permits and food-safety training", "A famous logo", "A fancy car"], answer: 0 },
      { q: "What makes a food truck a service?", choices: ["Big profits", "Caring for the people you feed", "Being trendy"], answer: 1 },
    ],
    biblical:
      "Work is service. Even the smallest kitchen on wheels can feed neighbors, support a family, and be a quiet light in a community.",
    familyChallenge: "Share your food truck concept card with one adult and ask: who in our community could this truck serve?",
  },

  {
    id: "restaurant-hospitality",
    title: "Restaurant Hospitality Basics",
    ageGroup: "17-19",
    path: "Restaurant Builder",
    time: "18 minutes",
    difficulty: "Advanced",
    safetyLevel: "Business Learning",
    badge: "restaurant-builder",
    plateKey: "restaurant",
    accent: "navy",
    summary:
      "Hospitality, team roles, cleanliness, and a one-page concept that serves a real community need.",
    welcome:
      "Welcome, future restaurateur. A great restaurant is more than great food. It is a team that makes every guest feel welcome, safe, and seen.",
    steps: [
      { id: "today-skill", title: "Today's Skill", body: "Define the four legs of a strong restaurant: hospitality, team, cleanliness, and concept." },
      { id: "why-matters", title: "Why It Matters", body: "Guests remember how they were treated long after they forget what they ate. Hospitality is the heart of the business." },
      { id: "safety-check", title: "Safety Note", body: "Real restaurants follow health codes, food temperature rules, and clean-as-you-go discipline. Today we learn the mindset." },
      { id: "plate-walk", title: "Teaching Plate Walkthrough", body: "The plate shows: NAME • CONCEPT • PROMISE • MENU • TEAM • CLEAN • GUEST • COMMUNITY. Read it as one story." },
      { id: "practice", title: "Student Practice", body: "Open the Restaurant Builder and fill out one concept page. Keep your community in mind the whole time." },
    ],
    quiz: [
      { q: "What do guests remember most?", choices: ["The decor", "How they were treated", "The chairs"], answer: 1 },
      { q: "Which is essential for a real restaurant?", choices: ["A famous chef", "Health codes and clean-as-you-go", "Loud music"], answer: 1 },
      { q: "Hospitality is best described as...", choices: ["Smiling sometimes", "Genuine welcome and care", "A fancy uniform"], answer: 1 },
    ],
    biblical:
      "Hospitality is one of the oldest virtues. To welcome a guest well is to honor a person made in the image of God.",
    familyChallenge: "Share your restaurant concept page with two adults and ask which community need it could serve.",
  },
];

export const GLOBAL_MISSIONS = [
  { id: "rice", title: "Rice Around the World", region: "Global", note: "How rice feeds more than half the planet — and what each tradition teaches us." },
  { id: "bread", title: "Bread Around the World", region: "Global", note: "From naan to sourdough — bread is one of the most universal foods on earth." },
  { id: "soup-stew", title: "Soup and Stew Traditions", region: "Global", note: "Slow, warm, and communal — every culture has its pot of love." },
  { id: "tropical-fruits", title: "Fruits of the Tropics", region: "Equatorial", note: "Mango, papaya, lychee, durian — the bright, sun-fed fruits of warm regions." },
  { id: "spices", title: "Spices and Smells", region: "Global", note: "How a pinch of spice can travel ten thousand miles in one breath." },
  { id: "family-meals", title: "Family Meals Across Cultures", region: "Global", note: "What does dinner look like in homes around the world? Curiosity over comparison." },
];

export const FAMILY_CHALLENGES = [
  { id: "fc-1", title: "Three Safety Zones", prompt: "Help an adult check the kitchen for three safety zones: clean hands, clear counter, and safe tools." },
  { id: "fc-2", title: "Colorful Snack Plate", prompt: "Build a colorful snack plate with an adult — fruit, protein, grain, water." },
  { id: "fc-3", title: "Set The Table", prompt: "Help set the table tonight and explain one safety rule you learned." },
  { id: "fc-4", title: "Family Memory Meal", prompt: "Ask a family member about a favorite meal from childhood. Take notes." },
  { id: "fc-5", title: "Plan One Dinner", prompt: "Help plan one dinner this week. Choose simple, balanced foods." },
  { id: "fc-6", title: "Serve Someone", prompt: "Serve a neighbor, church group, school group, or family member with a small food gift." },
];

export const ASK_PROMPTS = [
  "What does this mean?",
  "Why do we do this?",
  "Is this safe for me?",
  "Can you explain again?",
  "What is the biblical connection?",
];

export function getLessonsByAge(ageGroup) {
  if (!ageGroup || ageGroup === "parent") return LESSONS;
  return LESSONS.filter((l) => l.ageGroup === ageGroup);
}

export function getLessonById(id) {
  return LESSONS.find((l) => l.id === id);
}
