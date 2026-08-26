const PRIORITY_RULES = {
    // =========================
    // CRITICAL ISSUES
    // =========================

    road_blockage: {
        baseScore: 4,
        maxScore: 4,
        escalation: []
    },

    fallen_tree_blocking_road: {
        baseScore: 4,
        maxScore: 4,
        escalation: []
    },

    sewage_flooding: {
        baseScore: 4,
        maxScore: 4,
        escalation: []
    },

    exposed_electrical_wire: {
        baseScore: 4,
        maxScore: 4,
        escalation: []
    },

    major_electrical_hazard: {
        baseScore: 4,
        maxScore: 4,
        escalation: []
    },

    open_manhole: {
        baseScore: 3,
        maxScore: 4,
        escalation: [
            { reports: 3, score: 4 }
        ]
    },

    // =========================
    // HIGH PRIORITY ISSUES
    // =========================

    large_pothole: {
        baseScore: 3,
        maxScore: 3,
        escalation: []
    },

    major_water_leak: {
        baseScore: 3,
        maxScore: 4,
        escalation: [
            { reports: 5, score: 4 }
        ]
    },

    damaged_electrical_pole: {
        baseScore: 3,
        maxScore: 4,
        escalation: [
            { reports: 3, score: 4 }
        ]
    },

    // =========================
    // MEDIUM PRIORITY ISSUES
    // =========================

    small_pothole: {
        baseScore: 2,
        maxScore: 3,
        escalation: [
            { reports: 5, score: 3 }
        ]
    },

    broken_streetlight: {
        baseScore: 2,
        maxScore: 3,
        escalation: [
            { reports: 5, score: 3 }
        ]
    },

    minor_water_leak: {
        baseScore: 2,
        maxScore: 3,
        escalation: [
            { reports: 5, score: 3 }
        ]
    },

    minor_drainage_problem: {
        baseScore: 2,
        maxScore: 3,
        escalation: [
            { reports: 5, score: 3 }
        ]
    },

    // =========================
    // LOW PRIORITY ISSUES
    // =========================

    garbage_accumulation: {
        baseScore: 1,
        maxScore: 3,
        escalation: [
            { reports: 5, score: 2 },
            { reports: 15, score: 3 }
        ]
    },

    minor_public_infrastructure_damage: {
        baseScore: 1,
        maxScore: 3,
        escalation: [
            { reports: 5, score: 2 },
            { reports: 15, score: 3 }
        ]
    },

    // =========================
    // FALLBACK
    // =========================

    other: {
        baseScore: 1,
        maxScore: 3,
        escalation: [
            { reports: 5, score: 2 },
            { reports: 15, score: 3 }
        ]
    }
};

const SEVERITY_SCORES = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
};

module.exports = {
    PRIORITY_RULES,
    SEVERITY_SCORES
};