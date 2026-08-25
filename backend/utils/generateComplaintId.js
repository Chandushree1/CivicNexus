const Complaint = require("../models/Complaint");

// Generates IDs like CC-2026-001245
async function generateComplaintId() {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const seq = String(1245 + count).padStart(6, "0");
  return `CC-${year}-${seq}`;
}

module.exports = generateComplaintId;
