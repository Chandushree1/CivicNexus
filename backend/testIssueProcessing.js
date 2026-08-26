const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Issue = require("./models/Issue");
const {
  processIssue,
} = require("./services/issueService");

require("dotenv").config();


// =====================================================
// Load AI input
// =====================================================

const aiPath =
  path.join(__dirname, "ai.json");

const aiAnalysis =
  JSON.parse(
    fs.readFileSync(
      aiPath,
      "utf8"
    )
  );


// =====================================================
// Test data
// =====================================================

const TEST_PREFIX = "TEST-ISSUE-";


// =====================================================
// Cleanup
// =====================================================

async function cleanup() {
  await Issue.deleteMany({
    issueGroupId: {
      $regex: `^${TEST_PREFIX}`,
    },
  });
}


// =====================================================
// Print result
// =====================================================

function printResult(
  label,
  result
) {
  console.log(`\n${label}`);

  console.log(
    "Type:",
    result.type
  );

  console.log(
    "Issue Group:",
    result.issue.issueGroupId
  );

  console.log(
    "Issue Type:",
    result.issue.issueType
  );

  console.log(
    "Report Count:",
    result.issue.reportCount
  );

  console.log(
    "Priority:",
    result.issue.priority.level
  );

  console.log(
    "Priority Score:",
    result.issue.priority.score
  );

  if (
    result.distanceMeters !== undefined &&
    result.distanceMeters !== null
  ) {
    console.log(
      "Distance:",
      result.distanceMeters,
      "meters"
    );
  }
}


// =====================================================
// MAIN TEST
// =====================================================

async function runTests() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "Connected to MongoDB"
    );

    await cleanup();


    // =================================================
    // TEST 1
    // First complaint
    // =================================================

    const result1 =
      await processIssue({
        category:
          "Roads & Potholes",

        issueType:
          aiAnalysis.issueType,

        severity:
          aiAnalysis.severity,

        location: {
          address:
            "Test Location",

          lat:
            12.97160,

          lng:
            77.59450,

          ward:
            "Test Ward",
        },

        radiusMeters: 50,
      });

    // Give test issue predictable ID
    await Issue.updateOne(
      {
        _id: result1.issue._id,
      },
      {
        $set: {
          issueGroupId:
            `${TEST_PREFIX}001`,
        },
      }
    );

    result1.issue.issueGroupId =
      `${TEST_PREFIX}001`;

    printResult(
      "TEST 1: First report",
      result1
    );


    // =================================================
    // TEST 2
    // Same issue within 50m
    // =================================================

    const result2 =
      await processIssue({
        category:
          "Roads & Potholes",

        issueType:
          aiAnalysis.issueType,

        severity:
          aiAnalysis.severity,

        location: {
          address:
            "Nearby Test Location",

          lat:
            12.97163,

          lng:
            77.59453,

          ward:
            "Test Ward",
        },

        radiusMeters: 50,
      });

    printResult(
      "TEST 2: Same issue within 50m",
      result2
    );


    // =================================================
    // TEST 3
    // Same issue again
    // =================================================

    const result3 =
      await processIssue({
        category:
          "Roads & Potholes",

        issueType:
          aiAnalysis.issueType,

        severity:
          aiAnalysis.severity,

        location: {
          address:
            "Nearby Test Location",

          lat:
            12.97161,

          lng:
            77.59452,

          ward:
            "Test Ward",
        },

        radiusMeters: 50,
      });

    printResult(
      "TEST 3: Third report",
      result3
    );


    // =================================================
    // TEST 4
    // Same type but far away
    // =================================================

    const result4 =
      await processIssue({
        category:
          "Roads & Potholes",

        issueType:
          aiAnalysis.issueType,

        severity:
          aiAnalysis.severity,

        location: {
          address:
            "Far Away Location",

          lat:
            12.97250,

          lng:
            77.59550,

          ward:
            "Different Ward",
        },

        radiusMeters: 50,
      });

    printResult(
      "TEST 4: Same type but beyond 50m",
      result4
    );


    // =================================================
    // TEST 5
    // Different issue type
    // =================================================

    const result5 =
      await processIssue({
        category:
          "Roads & Potholes",

        issueType:
          "large_pothole",

        severity:
          "high",

        location: {
          address:
            "Nearby Test Location",

          lat:
            12.97162,

          lng:
            77.59451,

          ward:
            "Test Ward",
        },

        radiusMeters: 50,
      });

    printResult(
      "TEST 5: Different issue type",
      result5
    );


    // =================================================
    // DATABASE STATE
    // =================================================

    console.log(
      "\n========== DATABASE STATE =========="
    );

    const issues =
      await Issue.find({
        issueGroupId: {
          $regex: `^${TEST_PREFIX}`,
        },
      });

    for (const issue of issues) {
      console.log("\nIssue:", issue.issueGroupId);

      console.log(
        "Type:",
        issue.issueType
      );

      console.log(
        "Reports:",
        issue.reportCount
      );

      console.log(
        "Priority:",
        issue.priority.level
      );

      console.log(
        "Score:",
        issue.priority.score
      );
    }


    // =================================================
    // Cleanup
    // =================================================

    await cleanup();

    console.log(
      "\nTest issues deleted."
    );

  } catch (error) {
    console.error(
      "\nTEST ERROR:"
    );

    console.error(error);

  } finally {
    await mongoose.disconnect();

    console.log(
      "Disconnected from MongoDB"
    );
  }
}


runTests();