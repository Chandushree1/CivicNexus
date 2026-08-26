const CATEGORY_BASE_PRIORITY = {
  "Electricity": 3,
  "Drainage": 3,
  "Water Supply": 3,

  "Roads & Potholes": 2,
  "Streetlights": 2,
  "Garbage": 2,
  "Public Facilities": 2,

  "Parks": 1,
  "Other": 1,
};

const PRIORITY_LEVELS = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
};

function calculateInitialPriority(category) {
  const baseScore =
    CATEGORY_BASE_PRIORITY[category] || 1;

  return {
    baseScore,
    priorityScore: baseScore,
    priorityLevel: PRIORITY_LEVELS[baseScore],
  };
}

function calculatePriority(category, reportCount) {
  const baseScore =
    CATEGORY_BASE_PRIORITY[category] || 1;

  // Every additional report increases priority by 1.
  const priorityScore = Math.min(
    4,
    baseScore + (reportCount - 1)
  );

  return {
    baseScore,
    reportCount,
    priorityScore,
    priorityLevel:
      PRIORITY_LEVELS[priorityScore],
  };
}

module.exports = {
  calculateInitialPriority,
  calculatePriority,
  CATEGORY_BASE_PRIORITY,
};