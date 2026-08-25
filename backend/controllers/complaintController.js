const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");
const generateComplaintId = require("../utils/generateComplaintId");

// Haversine distance in km
function distanceKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v === undefined || v === null)) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function notify(userId, type, title, message, complaintId) {
  await Notification.create({ user: userId, type, title, message, complaint: complaintId });
}

// @route POST /api/complaints  (citizen)
exports.createComplaint = async (req, res) => {
  try {
    const { category, title, description, additionalDetails, priority, lat, lng, address, ward } = req.body;

    if (!category || !title || !description || !lat || !lng || !address) {
      return res.status(400).json({ message: "Missing required complaint fields" });
    }

    const photos = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));

    const complaintId = await generateComplaintId();
    const slaHours = priority === "Urgent" ? 48 : priority === "High" ? 96 : 168;

    const complaint = await Complaint.create({
      complaintId,
      citizen: req.user._id,
      category,
      title,
      description,
      additionalDetails,
      priority: priority || "Medium",
      photos,
      location: { address, lat, lng, ward },
      status: "Submitted",
      slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000),
      timeline: [{ status: "Submitted", note: "Complaint registered by citizen", actor: req.user._id }],
    });

    await notify(
      req.user._id,
      "complaint_submitted",
      "Complaint submitted",
      `${complaint.complaintId} — ${title} was registered successfully.`,
      complaint._id
    );

    res.status(201).json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/mine (citizen)
exports.getMyComplaints = async (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    const filter = { citizen: req.user._id };
    if (category && category !== "all") filter.category = category;
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { complaintId: new RegExp(search, "i") },
        { title: new RegExp(search, "i") },
        { "location.address": new RegExp(search, "i") },
      ];
    }
    let query = Complaint.find(filter).populate("assignedOfficer", "fullName designation");
    query = sort === "oldest" ? query.sort({ createdAt: 1 }) : query.sort({ createdAt: -1 });
    const complaints = await query;
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/:id
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.id }, { complaintId: req.params.id }],
    })
      .populate("citizen", "fullName email phone")
      .populate("assignedOfficer", "fullName designation department");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Citizens can only view their own complaints; officers/admins can view any
    if (req.user.role === "citizen" && String(complaint.citizen._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/nearby (officer) - unassigned + assigned-to-others, sorted by distance
exports.getNearbyIssues = async (req, res) => {
  try {
    const officer = req.user;
    const filter = { status: { $ne: "Resolved" } };
    if (officer.department) filter.category = officer.department;

    const complaints = await Complaint.find(filter).populate("citizen", "fullName");
    const withDistance = complaints
      .map((c) => ({
        complaint: c,
        distance: distanceKm(officer.location?.lat, officer.location?.lng, c.location.lat, c.location.lng),
      }))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

    res.json({
      items: withDistance.map(({ complaint, distance }) => ({ ...complaint.toObject(), distanceKm: distance })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/assigned (officer)
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedOfficer: req.user._id })
      .populate("citizen", "fullName")
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/map (officer) - open complaints plotted on mock map
exports.getMapComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: { $ne: "Resolved" } }).populate("citizen", "fullName");
    const officer = req.user;
    const items = complaints.map((c) => ({
      ...c.toObject(),
      distanceKm: distanceKm(officer.location?.lat, officer.location?.lng, c.location.lat, c.location.lng),
    }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/complaints/:id/accept (officer accepts an unassigned/nearby complaint)
exports.acceptComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.assignedOfficer = req.user._id;
    complaint.status = "Assigned";
    complaint.timeline.push({
      status: "Assigned",
      note: `${req.user.fullName} (${req.user.designation || "Officer"}) accepted this case`,
      actor: req.user._id,
    });
    await complaint.save();

    await notify(
      complaint.citizen,
      "officer_assigned",
      "Officer assigned",
      `${req.user.fullName} (${req.user.designation || "Officer"}) is now handling ${complaint.complaintId}.`,
      complaint._id
    );

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/complaints/:id/status (officer updates status / adds a field note)
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (status) complaint.status = status;
    complaint.timeline.push({
      status: status || complaint.status,
      note: note || `Status updated to ${status}`,
      actor: req.user._id,
    });
    await complaint.save();

    await notify(
      complaint.citizen,
      status === "Under Review" ? "status_changed" : "officer_update",
      status ? `Status changed to ${status}` : "Officer updated your complaint",
      note || `${complaint.complaintId} status changed to ${status}.`,
      complaint._id
    );

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/complaints/:id/resolve (officer, with optional resolution photo)
exports.resolveComplaint = async (req, res) => {
  try {
    const { note } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "Resolved";
    complaint.resolution = {
      note: note || "",
      photoUrl: req.file ? req.file.path : "",
      resolvedAt: new Date(),
    };
    complaint.timeline.push({ status: "Resolved", note: note || "Issue resolved", actor: req.user._id });
    await complaint.save();

    await notify(
      complaint.citizen,
      "complaint_resolved",
      "Complaint resolved",
      `${complaint.complaintId} — ${complaint.title} has been resolved. Please rate the resolution.`,
      complaint._id
    );

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/complaints/:id/rate (citizen rates a resolved complaint)
exports.rateComplaint = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (String(complaint.citizen) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    complaint.rating = rating;
    complaint.ratingComment = comment || "";
    await complaint.save();

    await notify(
      req.user._id,
      "feedback_thanks",
      "Thanks for your feedback",
      `You rated the resolution of ${complaint.complaintId} ${rating} stars.`,
      complaint._id
    );

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/stats/citizen
exports.citizenStats = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id });
    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => ["Submitted", "Under Review"].includes(c.status)).length,
      inProgress: complaints.filter((c) => ["Assigned", "In Progress"].includes(c.status)).length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    };
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/stats/officer
exports.officerStats = async (req, res) => {
  try {
    const assigned = await Complaint.find({ assignedOfficer: req.user._id });
    const now = new Date();
    const stats = {
      assigned: assigned.length,
      newComplaints: assigned.filter((c) => c.status === "Assigned").length,
      inProgress: assigned.filter((c) => c.status === "In Progress").length,
      resolved: assigned.filter((c) => c.status === "Resolved").length,
      overdue: assigned.filter((c) => c.slaDeadline && c.slaDeadline < now && c.status !== "Resolved").length,
    };
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/public/recent (public landing page feed, no auth)
exports.getPublicRecent = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .select("complaintId title category status priority location createdAt");
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints/public/category-counts
exports.getCategoryCounts = async (req, res) => {
  try {
    const counts = await Complaint.aggregate([
      { $match: { status: { $ne: "Resolved" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res.json({ counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
