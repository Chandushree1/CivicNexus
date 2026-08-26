const {
    calculatePriority
} = require("./services/priorityService");


// ==========================================
// SMALL POTHOLE
// Maximum priority = HIGH
// ==========================================

console.log("\n--- Small Pothole ---");

console.log(
    "1 report:",
    calculatePriority("small_pothole", "low", 1)
);

console.log(
    "4 reports:",
    calculatePriority("small_pothole", "low", 4)
);

console.log(
    "5 reports:",
    calculatePriority("small_pothole", "low", 5)
);

console.log(
    "20 reports:",
    calculatePriority("small_pothole", "low", 20)
);


// ==========================================
// GARBAGE
// Low → Medium → High
// ==========================================

console.log("\n--- Garbage Accumulation ---");

console.log(
    "1 report:",
    calculatePriority("garbage_accumulation", "low", 1)
);

console.log(
    "4 reports:",
    calculatePriority("garbage_accumulation", "low", 4)
);

console.log(
    "5 reports:",
    calculatePriority("garbage_accumulation", "low", 5)
);

console.log(
    "14 reports:",
    calculatePriority("garbage_accumulation", "low", 14)
);

console.log(
    "15 reports:",
    calculatePriority("garbage_accumulation", "low", 15)
);


// ==========================================
// ROAD BLOCKAGE
// Always Critical
// ==========================================

console.log("\n--- Road Blockage ---");

console.log(
    "1 report:",
    calculatePriority("road_blockage", "critical", 1)
);

console.log(
    "10 reports:",
    calculatePriority("road_blockage", "critical", 10)
);


// ==========================================
// OPEN MANHOLE
// High → Critical
// ==========================================

console.log("\n--- Open Manhole ---");

console.log(
    "1 report:",
    calculatePriority("open_manhole", "high", 1)
);

console.log(
    "2 reports:",
    calculatePriority("open_manhole", "high", 2)
);

console.log(
    "3 reports:",
    calculatePriority("open_manhole", "high", 3)
);


// ==========================================
// ELECTRICAL HAZARD
// Always Critical
// ==========================================

console.log("\n--- Exposed Electrical Wire ---");

console.log(
    "1 report:",
    calculatePriority(
        "exposed_electrical_wire",
        "critical",
        1
    )
);

console.log(
    "10 reports:",
    calculatePriority(
        "exposed_electrical_wire",
        "critical",
        10
    )
);