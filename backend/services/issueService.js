const Issue = require("../models/Issue");
const Complaint = require("../models/Complaint");
const {
  calculateInitialPriority,
  calculatePriority,
} = require("./priorityService");

const DEFAULT_RADIUS_METERS = 50;

const EARTH_RADIUS_METERS = 6371000;


// =====================================================
// Generate Issue Group ID
// =====================================================

function generateIssueGroupId() {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 7);

  return `ISSUE-${Date.now()}-${randomPart}`;
}


// =====================================================
// Calculate distance using Haversine formula
// =====================================================

function calculateDistance(lat1, lng1, lat2, lng2) {
  const toRadians = (degrees) =>
    (degrees * Math.PI) / 180;

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return EARTH_RADIUS_METERS * c;
}


// =====================================================
// Find existing matching issue
// =====================================================

async function findMatchingIssue({
  category,
  issueType,
  lat,
  lng,
  radiusMeters = DEFAULT_RADIUS_METERS,
}) {
  if (
    !category ||
    !issueType ||
    lat == null ||
    lng == null
  ) {
    throw new Error(
      "category, issueType, lat and lng are required"
    );
  }

  console.log("\n========== ISSUE MATCH DEBUG ==========");
console.log("Looking for category:", category);
console.log("Looking for issueType:", issueType);
console.log("Looking for location:", lat, lng);

  const issues = await Issue.find({
    category,
    issueType,
    status: "Active",
  });

  console.log("Active matching-type issues found:", issues.length);

for (const issue of issues) {
  console.log({
    issueGroupId: issue.issueGroupId,
    category: issue.category,
    issueType: issue.issueType,
    lat: issue.location.lat,
    lng: issue.location.lng,
    reportCount: issue.reportCount,
    distance: calculateDistance(
      lat,
      lng,
      issue.location.lat,
      issue.location.lng
    ),
  });
}

console.log("====================================\n");

  let closestIssue = null;
  let closestDistance = Infinity;

  for (const issue of issues) {
    const distance = calculateDistance(
      lat,
      lng,
      issue.location.lat,
      issue.location.lng
    );

    if (
      distance <= radiusMeters &&
      distance < closestDistance
    ) {
      closestIssue = issue;
      closestDistance = distance;
    }
  }

  if (!closestIssue) {
    return null;
  }

  return {
    issue: closestIssue,
    distanceMeters: Math.round(
      closestDistance
    ),
  };
}


// =====================================================
// Create a new Issue
// =====================================================

async function createNewIssue({
  category,
  issueType,
  severity,
  location,
}) {
  const initialPriority =
  calculateInitialPriority(category);

  const issueGroupId =
    generateIssueGroupId();

  const issue = await Issue.create({
    issueGroupId,

    category,

    issueType,

    severity,

    location: {
      address: location.address || "",
      lat: location.lat,
      lng: location.lng,
      ward: location.ward || "",
    },

    reportCount: 1,

    priority: {
      level:
        initialPriority.priorityLevel,

      score:
        initialPriority.priorityScore,

      baseScore:
        initialPriority.baseScore,
    },

    status: "Active",
  });

  return {
    type: "new",
    issue,
    distanceMeters: null,
  };
}


// =====================================================
// Add another report to existing Issue
// =====================================================

async function addReportToIssue({
  issue,
  severity,
}) {
  const newReportCount =
    issue.reportCount + 1;

  const updatedPriority =
  calculatePriority(
    issue.category,
    newReportCount
  );

  issue.reportCount =
    newReportCount;

  issue.severity = severity;

  issue.priority = {
    level:
      updatedPriority.priorityLevel,

    score:
      updatedPriority.priorityScore,

    baseScore:
      updatedPriority.baseScore,
  };

  await issue.save();

  return {
    type: "existing",
    issue,
    reportCount: newReportCount,
    priority: updatedPriority,
  };
}


// =====================================================
// MAIN FUNCTION
// =====================================================

async function processIssue({
  category,
  issueType,
  severity,
  location,
  citizenId,
  radiusMeters = DEFAULT_RADIUS_METERS,
}) {
  const match =
    await findMatchingIssue({
      category,
      issueType,
      lat: location.lat,
      lng: location.lng,
      radiusMeters,
    });

  // -----------------------------------------------
  // No existing issue
  // -----------------------------------------------

  if (!match) {
    return createNewIssue({
      category,
      issueType,
      severity,
      location,
    });
  }

  const existingIssue =
    match.issue;

  // -----------------------------------------------
  // Check whether THIS citizen already reported it
  // -----------------------------------------------

  if (citizenId) {
    const existingReport =
      await Complaint.findOne({
        citizen: citizenId,

        issueGroupId:
          existingIssue.issueGroupId,

        status: {
          $ne: "Resolved",
        },
      });

    if (existingReport) {
      return {
        type: "duplicate_citizen_report",

        issue: existingIssue,

        existingComplaint:
          existingReport,

        reportCount:
          existingIssue.reportCount,

        priority:
          existingIssue.priority,

        distanceMeters:
          match.distanceMeters,
      };
    }
  }

  // -----------------------------------------------
  // New citizen → increase report count
  // -----------------------------------------------

  return addReportToIssue({
    issue: existingIssue,
    severity,
  });
}


module.exports = {
  calculateDistance,
  findMatchingIssue,
  createNewIssue,
  addReportToIssue,
  processIssue,
};