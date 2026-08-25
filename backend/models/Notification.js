const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "complaint_submitted",
        "officer_assigned",
        "status_changed",
        "officer_update",
        "complaint_resolved",
        "feedback_thanks",
      ],
      default: "status_changed",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
