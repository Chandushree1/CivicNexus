const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    issueGroupId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
    },

    issueType: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    location: {
      address: {
        type: String,
        default: "",
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
        default: "",
      },
    },

    // Number of citizens who reported this same issue
    reportCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    priority: {
      level: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
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

    status: {
      type: String,
      enum: [
        "Active",
        "Resolved",
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

issueSchema.index({
  "location.lat": 1,
  "location.lng": 1,
});

module.exports = mongoose.model("Issue", issueSchema);