const Complaint = require("../models/Complaint");

// Generates IDs like:
// CC-2026-001245
//
// Uses the highest existing complaint number and
// increments it, instead of relying on document count.

async function generateComplaintId() {
  const year = new Date().getFullYear();

  const latestComplaint =
    await Complaint.findOne({
      complaintId: {
        $regex: `^CC-${year}-`,
      },
    })
      .sort({
        complaintId: -1,
      })
      .select("complaintId")
      .lean();

  let nextNumber = 1245;

  if (latestComplaint?.complaintId) {
    const parts =
      latestComplaint.complaintId.split("-");

    const lastNumber =
      parseInt(parts[2], 10);

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `CC-${year}-${String(nextNumber).padStart(6, "0")}`;
}

module.exports = generateComplaintId;