const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const { findMatchingIssue } = require("./services/issueService");

require("dotenv").config();

const TEST_COMPLAINT_ID = "TEST-MATCH-001";

async function runTests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clean up any previous test document
    await Complaint.deleteOne({
      complaintId: TEST_COMPLAINT_ID
    });

    // --------------------------------------------------
    // 1. Create fake existing complaint
    // --------------------------------------------------

    const testComplaint = await Complaint.create({
      complaintId: TEST_COMPLAINT_ID,

      // We don't need a real citizen for this test.
      // This will be handled below if the schema requires it.
      citizen: new mongoose.Types.ObjectId(),

      category: "Roads & Potholes",

      title: "Test pothole",

      description: "Test complaint for duplicate detection",

      aiAnalysis: {
        issueType: "small_pothole",
        severity: "low",
        confidence: 0.95,
        hazards: [],
        suggestedCategory: "Roads & Potholes",
        categoryMismatch: false
      },

      priority: {
        level: "Medium",
        score: 2,
        baseScore: 2
      },

      reportCount: 1,

      location: {
        address: "Test Location",
        lat: 12.97160,
        lng: 77.59450
      },

      status: "Submitted"
    });

    console.log("\nCreated test complaint:");
    console.log(testComplaint.complaintId);

    // --------------------------------------------------
    // 2. Test: SAME ISSUE within 50m
    // --------------------------------------------------

    console.log("\nTEST 1: Same issue within 50m");

    const match1 = await findMatchingIssue({
      category: "Roads & Potholes",
      issueType: "small_pothole",
      lat: 12.97163,
      lng: 77.59453,
      radiusMeters: 50
    });

    if (match1) {
      console.log("PASS");
      console.log(
        `Matched ${match1.complaint.complaintId}`
      );
      console.log(
        `Distance: ${match1.distanceMeters}m`
      );
    } else {
      console.log("FAIL - No match found");
    }

    // --------------------------------------------------
    // 3. Test: SAME ISSUE beyond 50m
    // --------------------------------------------------

    console.log("\nTEST 2: Same issue beyond 50m");

    const match2 = await findMatchingIssue({
      category: "Roads & Potholes",
      issueType: "small_pothole",
      lat: 12.97250,
      lng: 77.59550,
      radiusMeters: 50
    });

    if (!match2) {
      console.log("PASS - No match found");
    } else {
      console.log("FAIL - Incorrect match");
      console.log(
        `Matched at ${match2.distanceMeters}m`
      );
    }

    // --------------------------------------------------
    // 4. Test: Different issue type
    // --------------------------------------------------

    console.log("\nTEST 3: Different issue type");

    const match3 = await findMatchingIssue({
      category: "Roads & Potholes",
      issueType: "large_pothole",
      lat: 12.97163,
      lng: 77.59453,
      radiusMeters: 50
    });

    if (!match3) {
      console.log("PASS - Different issue type not matched");
    } else {
      console.log("FAIL - Different issue type matched");
    }

    // --------------------------------------------------
    // 5. Test: Resolved complaint
    // --------------------------------------------------

    console.log("\nTEST 4: Resolved complaint");

    await Complaint.updateOne(
      { complaintId: TEST_COMPLAINT_ID },
      { status: "Resolved" }
    );

    const match4 = await findMatchingIssue({
      category: "Roads & Potholes",
      issueType: "small_pothole",
      lat: 12.97163,
      lng: 77.59453,
      radiusMeters: 50
    });

    if (!match4) {
      console.log("PASS - Resolved complaint not matched");
    } else {
      console.log("FAIL - Resolved complaint matched");
    }

    // --------------------------------------------------
    // Cleanup
    // --------------------------------------------------

    await Complaint.deleteOne({
      complaintId: TEST_COMPLAINT_ID
    });

    console.log("\nTest complaint deleted.");

  } catch (error) {
    console.error("\nTEST ERROR:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

runTests();
