const mongoose = require("mongoose");

// =====================================================
// TIMELINE EVENT
// =====================================================

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);


// =====================================================
// AI ANALYSIS
// =====================================================

const aiAnalysisSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      default: "other",
      trim: true,
    },

    severity: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical",
      ],
      default: "low",
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    hazards: {
      type: [String],
      default: [],
    },

    suggestedCategory: {
      type: String,
      default: "",
      trim: true,
    },

    categoryMismatch: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);


// =====================================================
// PRIORITY
// =====================================================

const prioritySchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    score: {
      type: Number,
      min: 1,
      max: 4,
      default: 2,
    },

    baseScore: {
      type: Number,
      min: 1,
      max: 4,
      default: 2,
    },
  },
  { _id: false }
);


// =====================================================
// COMPLAINT
// =====================================================

const complaintSchema = new mongoose.Schema(
  {
    // ================================================
    // COMPLAINT ID
    // ================================================

    complaintId: {
      type: String,
      required: true,
      unique: true,
    },


    // ================================================
    // CITIZEN
    // ================================================

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // ================================================
    // CATEGORY
    // ================================================

    category: {
      type: String,
      required: true,

      enum: [
        "Roads & Potholes",
        "Garbage",
        "Streetlights",
        "Drainage",
        "Water Supply",
        "Public Facilities",
        "Parks",
        "Electricity",
        "Other",
      ],
    },


    // ================================================
    // BASIC DETAILS
    // ================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    additionalDetails: {
      type: String,
      default: "",
    },


    // ================================================
    // AI ANALYSIS
    // ================================================

    /*
     * Temporary source:
     * backend/ai.json
     *
     * Later this will contain the actual
     * AI model output.
     */

    aiAnalysis: {
      type: aiAnalysisSchema,
      default: () => ({}),
    },


    // ================================================
    // CALCULATED PRIORITY
    // ================================================

    /*
     * Priority is NOT selected by the citizen.
     *
     * It is calculated using:
     *
     * AI severity
     * + issue type base priority
     * + number of reports
     */

    priority: {
      type: prioritySchema,
      default: () => ({}),
    },


    // ================================================
    // ISSUE GROUPING
    // ================================================

    /*
     * All complaints referring to the same
     * physical civic problem share the same
     * issueGroupId.
     *
     * Example:
     *
     * Citizen A → ISSUE-001
     * Citizen B → ISSUE-001
     * Citizen C → ISSUE-001
     *
     * This allows us to aggregate multiple
     * citizen reports into one physical issue.
     */

    issueGroupId: {
      type: String,
      default: null,
      index: true,
    },


    // ================================================
    // REPORT COUNT
    // ================================================

    /*
     * Number of reports associated with the
     * same physical issue.
     *
     * IMPORTANT:
     *
     * The authoritative aggregate count is
     * maintained by the Issue document.
     *
     * This field is kept on the Complaint for
     * convenient display/backward compatibility.
     */

    reportCount: {
      type: Number,
      default: 1,
      min: 1,
    },


    // ================================================
    // PHOTOS
    // ================================================

    photos: [
      {
        url: String,
        publicId: String,
      },
    ],


    // ================================================
    // LOCATION
    // ================================================

    location: {
      address: {
        type: String,
        required: true,
      },

      lat: {
        type: Number,
        required: true,
      },

      lng: {
        type: Number,
        required: true,
      },

      ward: {
        type: String,
      },
    },


    // ================================================
    // STATUS
    // ================================================

    status: {
      type: String,

      enum: [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
      ],

      default: "Submitted",
    },


    // ================================================
    // ASSIGNED OFFICER
    // ================================================

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    // ================================================
    // RESOLUTION
    // ================================================

    resolution: {
      note: {
        type: String,
        default: "",
      },

      photoUrl: {
        type: String,
        default: "",
      },

      resolvedAt: {
        type: Date,
      },
    },


    // ================================================
    // RATING
    // ================================================

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    ratingComment: {
      type: String,
      default: "",
    },


    // ================================================
    // SLA
    // ================================================

    slaDeadline: {
      type: Date,
    },


    // ================================================
    // TIMELINE
    // ================================================

    timeline: [
      timelineEventSchema
    ],
  },

  {
    timestamps: true,
  }
);


// =====================================================
// INDEXES
// =====================================================

// Geographic lookup
complaintSchema.index({
  "location.lat": 1,
  "location.lng": 1,
});

// issueGroupId index is already created by:
// index: true
//
// DO NOT add another:
// complaintSchema.index({ issueGroupId: 1 });


// complaintId unique: true already creates
// the complaintId index.
//
// DO NOT add:
// complaintSchema.index({ complaintId: 1 });


// =====================================================
// MODEL
// =====================================================

module.exports =
  mongoose.model(
    "Complaint",
    complaintSchema
  );