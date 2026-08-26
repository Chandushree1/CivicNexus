const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

// @route GET /api/admin/overview
exports.getOverview = async (req, res) => {
  try {
    const [totalComplaints, resolved, citizens, officers] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Resolved" }),
      User.countDocuments({ role: "citizen" }),
      User.countDocuments({ role: "officer" }),
    ]);

    const now = new Date();
    const overdue = await Complaint.countDocuments({
      status: { $ne: "Resolved" },
      slaDeadline: { $lt: now },
    });
    const unassigned = await Complaint.countDocuments({
      assignedOfficer: null,
      status: { $ne: "Resolved" },
    });

    const resolvedWithTimes = await Complaint.find({ status: "Resolved", "resolution.resolvedAt": { $ne: null } })
      .select("createdAt resolution.resolvedAt")
      .lean();
    const avgResolutionDays = resolvedWithTimes.length
      ? (
          resolvedWithTimes.reduce(
            (sum, c) => sum + (new Date(c.resolution.resolvedAt) - new Date(c.createdAt)) / 86400000,
            0
          ) / resolvedWithTimes.length
        ).toFixed(1)
      : 0;

    const ratingAgg = await Complaint.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    res.json({
      stats: {
        totalComplaints,
        resolved,
        pending: totalComplaints - resolved,
        overdue,
        unassigned,
        citizens,
        officers,
        avgResolutionDays: Number(avgResolutionDays),
        avgRating: ratingAgg[0] ? Number(ratingAgg[0].avg.toFixed(1)) : null,
        resolutionRate: totalComplaints ? Math.round((resolved / totalComplaints) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/complaints  (all complaints, with filters)
exports.getAllComplaints = async (req, res) => {
  try {
    const { search, category, status, priority, ward, officer } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (status && status !== "all") filter.status = status;
    if (priority && priority !== "all") filter.priority = priority;
    if (ward && ward !== "all") filter["location.ward"] = ward;
    if (officer === "unassigned") filter.assignedOfficer = null;
    else if (officer && officer !== "all") filter.assignedOfficer = officer;
    if (search) {
      filter.$or = [
        { complaintId: new RegExp(search, "i") },
        { title: new RegExp(search, "i") },
        { "location.address": new RegExp(search, "i") },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate("citizen", "fullName email phone")
      .populate("assignedOfficer", "fullName designation department")
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/admin/complaints/:id/assign  { officerId }
exports.reassignComplaint = async (req, res) => {
  try {
    const { officerId } = req.body;
    const officer = await User.findOne({ _id: officerId, role: "officer" });
    if (!officer) return res.status(404).json({ message: "Officer not found" });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    complaint.assignedOfficer = officer._id;
    if (complaint.status === "Submitted" || complaint.status === "Under Review") {
      complaint.status = "Assigned";
    }
    complaint.timeline.push({
      status: complaint.status,
      note: `Reassigned to ${officer.fullName} (${officer.designation || "Officer"}) by admin`,
      actor: req.user._id,
    });
    try {
      await complaint.save();
      console.log("✅ Complaint saved successfully");
    } catch (error) {
      console.error("❌ Complaint save failed:", error);
      throw error;
    }   

    const verifyComplaint = await Complaint.findById(req.params.id);

console.log("From DB:", verifyComplaint);
console.log("Assigned officer from DB:", verifyComplaint.assignedOfficer);

    await Notification.create({
      user: complaint.citizen,
      type: "officer_assigned",
      title: "Officer assigned",
      message: `${officer.fullName} (${officer.designation || "Officer"}) is now handling ${complaint.complaintId}.`,
      complaint: complaint._id,
    });

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/officers
exports.getOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: "officer" }).sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      officers.map(async (o) => {
        const [assigned, resolved] = await Promise.all([
          Complaint.countDocuments({ assignedOfficer: o._id }),
          Complaint.countDocuments({ assignedOfficer: o._id, status: "Resolved" }),
        ]);
        return { ...o.toSafeObject(), assignedCount: assigned, resolvedCount: resolved };
      })
    );
    res.json({ officers: withCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/admin/officers  (admin creates an officer account)
exports.createOfficer = async (req, res) => {
  try {
    const { fullName, email, phone, password, designation, department, ward } = req.body;
    if (!fullName || !email || !password || !department) {
      return res.status(400).json({ message: "Full name, email, password and department are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const officer = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "officer",
      designation,
      department,
      ward,
      createdByAdmin: req.user._id,
    });
    res.status(201).json({ officer: officer.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/admin/officers/:id
exports.updateOfficer = async (req, res) => {
  try {
    const { fullName, phone, designation, department, ward, isActive } = req.body;
    const officer = await User.findOne({ _id: req.params.id, role: "officer" });
    if (!officer) return res.status(404).json({ message: "Officer not found" });

    if (fullName !== undefined) officer.fullName = fullName;
    if (phone !== undefined) officer.phone = phone;
    if (designation !== undefined) officer.designation = designation;
    if (department !== undefined) officer.department = department;
    if (ward !== undefined) officer.ward = ward;
    if (isActive !== undefined) officer.isActive = isActive;

    await officer.save();
    res.json({ officer: officer.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/admin/officers/:id
exports.deleteOfficer = async (req, res) => {
  try {
    const officer = await User.findOne({ _id: req.params.id, role: "officer" });
    if (!officer) return res.status(404).json({ message: "Officer not found" });

    const activeCases = await Complaint.countDocuments({
      assignedOfficer: officer._id,
      status: { $ne: "Resolved" },
    });
    if (activeCases > 0) {
      return res
        .status(400)
        .json({ message: `Cannot remove: officer has ${activeCases} unresolved case(s). Reassign them first.` });
    }

    await officer.deleteOne();
    res.json({ message: "Officer removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/analytics/wards
exports.getWardAnalytics = async (req, res) => {
  try {
    const rows = await Complaint.aggregate([
      {
        $group: {
          _id: "$location.ward",
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ["$status", "Resolved"] }, { $lt: ["$slaDeadline", new Date()] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const wards = rows.map((r) => ({
      ward: r._id || "Unassigned ward",
      total: r.total,
      resolved: r.resolved,
      overdue: r.overdue,
      resolutionRate: r.total ? Math.round((r.resolved / r.total) * 100) : 0,
    }));

    res.json({ wards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/analytics/categories
exports.getCategoryAnalytics = async (req, res) => {
  try {
    const rows = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json({ categories: rows.map((r) => ({ category: r._id, total: r.total, resolved: r.resolved })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/citizens  (simple directory, read-only)
exports.getCitizens = async (req, res) => {
  try {
    const citizens = await User.find({ role: "citizen" }).sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      citizens.map(async (c) => {
        const count = await Complaint.countDocuments({ citizen: c._id });
        return { ...c.toSafeObject(), complaintCount: count };
      })
    );
    res.json({ citizens: withCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
