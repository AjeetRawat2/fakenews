export const TOPIC_CATEGORIES = [
  "health",
  "politics",
  "war_conflict",
  "economy",
  "technology",
  "environment",
  "crime",
  "science",
  "entertainment",
  "other",
];

export const TOPIC_SUBCATEGORIES = {
  health: [
    "vaccines",
    "disease",
    "medical_treatment",
    "nutrition",
    "public_health",
  ],

  politics: [
    "elections",
    "government_policy",
    "international_relations",
    "political_figures",
  ],

  war_conflict: ["military_action", "terrorism", "weapons", "geopolitics"],

  economy: ["inflation", "taxation", "financial_markets", "cryptocurrency"],

  technology: ["ai", "cybersecurity", "space", "consumer_tech"],

  environment: ["climate_change", "natural_disasters", "energy"],
};

export const TOPIC_SENSITIVITY = {
  health: 1.0,
  politics: 0.9,
  war_conflict: 0.9,
  economy: 0.75,
  technology: 0.6,
  environment: 0.7,
  crime: 0.65,
  science: 0.5,
  entertainment: 0.2,
  other: 0.3,
};
