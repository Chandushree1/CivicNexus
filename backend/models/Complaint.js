const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true }, // CC-2026-001245
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

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
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    additionalDetails: { type: String, default: "" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },

    photos: [{ url: String, publicId: String }],

    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      ward: { type: String },
    },

    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"],
      default: "Submitted",
    },

    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    resolution: {
      note: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      resolvedAt: { type: Date },
    },

    rating: { type: Number, min: 1, max: 5, default: null },
    ratingComment: { type: String, default: "" },

    slaDeadline: { type: Date },

    timeline: [timelineEventSchema],
  },
  { timestamps: true }
);

complaintSchema.index({ "location.lat": 1, "location.lng": 1 });
complaintSchema.index({ complaintId: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
