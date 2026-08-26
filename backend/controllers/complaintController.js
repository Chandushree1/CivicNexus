const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");
const generateComplaintId = require("../utils/generateComplaintId");
const Issue = require("../models/Issue");
const fs = require("fs");
const path = require("path");

const {
  processIssue,
} = require("../services/issueService");


// =====================================================
// Temporary AI input
// =====================================================

const aiPath = path.join(__dirname, "../ai.json");


// =====================================================
// Haversine distance in km
// =====================================================

function distanceKm(lat1, lng1, lat2, lng2) {
  if (
    [lat1, lng1, lat2, lng2].some(
      (v) => v === undefined || v === null
    )
  ) {
    return null;
  }

  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}


// =====================================================
// Notification helper
// =====================================================

async function notify(
  userId,
  type,
  title,
  message,
  complaintId
) {
  await Notification.create({
    user: userId,
    type,
    title,
    message,
    complaint: complaintId,
  });
}


// =====================================================
// SLA calculation
// =====================================================

function getSlaHours(priorityLevel) {
  switch (priorityLevel) {
    case "Critical":
      return 48;

    case "High":
      return 96;

    case "Medium":
      return 168;

    case "Low":
      return 240;

    default:
      return 168;
  }
}


// =====================================================
// POST /api/complaints
// Citizen creates complaint
// =====================================================

exports.createComplaint = async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      additionalDetails,
      lat,
      lng,
      address,
      ward,
    } = req.body;


    // -----------------------------------------------
    // Validate required fields
    // -----------------------------------------------

    if (
      !category ||
      !title ||
      !description ||
      lat === undefined ||
      lat === null ||
      lng === undefined ||
      lng === null ||
      !address
    ) {
      return res.status(400).json({
        message:
          "Missing required complaint fields",
      });
    }


    // -----------------------------------------------
    // Photos
    // -----------------------------------------------

    const photos = (req.files || []).map(
      (f) => ({
        url: f.path,
        publicId: f.filename,
      })
    );


    // -----------------------------------------------
    // TEMPORARY AI INPUT
    // -----------------------------------------------

    if (!fs.existsSync(aiPath)) {
      return res.status(500).json({
        message:
          "AI analysis configuration not found",
      });
    }

    const aiAnalysis = JSON.parse(
      fs.readFileSync(
        aiPath,
        "utf8"
      )
    );


    if (
      !aiAnalysis.issueType ||
      !aiAnalysis.severity
    ) {
      return res.status(500).json({
        message:
          "Invalid AI analysis result",
      });
    }


    // -----------------------------------------------
    // PROCESS ISSUE
    //
    // This will:
    //
    // 1. Find an existing nearby issue
    // 2. OR create a new issue
    // 3. Increment reportCount if existing
    // 4. Recalculate priority
    // -----------------------------------------------

    const issueResult =
  await processIssue({
    category,

    issueType:
      aiAnalysis.issueType,

    severity:
      aiAnalysis.severity,

    citizenId:
      req.user._id,

    location: {
      address,
      lat: Number(lat),
      lng: Number(lng),
      ward: ward || "",
    },

    radiusMeters: 50,
  });


    const issue =
      issueResult.issue;
    if (
  issueResult.type ===
  "duplicate_citizen_report"
) {
  return res.status(409).json({
    message:
      "You have already reported this issue.",

    complaintId:
      issueResult.existingComplaint
        .complaintId,

    issueGroupId:
      issue.issueGroupId,

    reportCount:
      issue.reportCount,

    priority:
      issue.priority,
  });
}
    // -----------------------------------------------
// Prevent the same citizen from reporting
// the same physical issue more than once
// -----------------------------------------------

const existingCitizenReport =
  await Complaint.findOne({
    citizen: req.user._id,

    issueGroupId:
      issue.issueGroupId,

    status: {
      $ne: "Resolved",
    },
  });

if (existingCitizenReport) {
  return res.status(409).json({
    message:
      "You have already reported this issue.",

    complaintId:
      existingCitizenReport.complaintId,

    issueGroupId:
      issue.issueGroupId,

    reportCount:
      issue.reportCount,

    priority:
      issue.priority,
  });
}


    // -----------------------------------------------
    // Generate citizen complaint ID
    // -----------------------------------------------

    const complaintId =
      await generateComplaintId();


    // -----------------------------------------------
    // Priority comes from the priority engine
    // NOT from user input
    // -----------------------------------------------

    const priority = {
      level:
        issue.priority.level,

      score:
        issue.priority.score,

      baseScore:
        issue.priority.baseScore,
    };


    // -----------------------------------------------
    // SLA
    // -----------------------------------------------

    const slaHours =
      getSlaHours(priority.level);

    const slaDeadline =
      new Date(
        Date.now() +
          slaHours *
            60 *
            60 *
            1000
      );


    // -----------------------------------------------
    // Create individual citizen complaint
    // -----------------------------------------------

    const complaint =
      await Complaint.create({
        complaintId,

        citizen:
          req.user._id,

        category,

        title,

        description,

        additionalDetails:
          additionalDetails || "",

        // AI result
        aiAnalysis: {
          issueType:
            aiAnalysis.issueType,

          severity:
            aiAnalysis.severity,

          confidence:
            aiAnalysis.confidence || 0,

          hazards:
            aiAnalysis.hazards || [],

          suggestedCategory:
            aiAnalysis.suggestedCategory || "",

          categoryMismatch:
            aiAnalysis.categoryMismatch || false,
        },

        // Calculated priority
        priority,

        // Link citizen complaint
        // to the aggregated Issue
        issueGroupId:
          issue.issueGroupId,

        // Each Complaint is one citizen report.
        // Aggregate count belongs to Issue.
        reportCount: 1,

        photos,

        location: {
          address,

          lat: Number(lat),

          lng: Number(lng),

          ward: ward || "",
        },

        status: "Submitted",

        slaDeadline,

        timeline: [
          {
            status: "Submitted",

            note:
              issueResult.type === "existing"
                ? "Complaint registered and linked to an existing civic issue"
                : "Complaint registered and new civic issue created",

            actor:
              req.user._id,
          },
        ],
      });


    // -----------------------------------------------
    // Notification
    // -----------------------------------------------

    await notify(
      req.user._id,

      "complaint_submitted",

      "Complaint submitted",

      `${complaint.complaintId} — ${title} was registered successfully. Priority: ${priority.level}.`,

      complaint._id
    );


    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.status(201).json({
      complaint,

      issue: {
        issueGroupId:
          issue.issueGroupId,

        reportCount:
          issue.reportCount,

        priority:
          issue.priority,

        issueType:
          issue.issueType,

        matchedExistingIssue:
          issueResult.type === "existing",

        distanceMeters:
          issueResult.distanceMeters ??
          null,
      },
    });

  } catch (err) {
    console.error(
      "createComplaint error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// =====================================================
// GET /api/complaints/mine
// Citizen
// =====================================================

exports.getMyComplaints = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      sort,
    } = req.query;

    const filter = {
      citizen: req.user._id,
    };

    if (
      category &&
      category !== "all"
    ) {
      filter.category = category;
    }

    if (
      status &&
      status !== "all"
    ) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          complaintId:
            new RegExp(search, "i"),
        },
        {
          title:
            new RegExp(search, "i"),
        },
        {
          "location.address":
            new RegExp(search, "i"),
        },
      ];
    }

    let query =
      Complaint.find(filter)
        .populate(
          "assignedOfficer",
          "fullName designation"
        );

    query =
      sort === "oldest"
        ? query.sort({ createdAt: 1 })
        : query.sort({ createdAt: -1 });

    const complaints =
      await query;

    res.json({
      complaints,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// =====================================================
// GET /api/complaints/:id
// =====================================================

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      $or: [
        { _id: req.params.id },
        { complaintId: req.params.id },
      ],
    })
      .populate(
        "citizen",
        "fullName email phone"
      )
      .populate(
        "assignedOfficer",
        "fullName designation department"
      );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Citizens can only view their own complaints
    if (
      req.user.role === "citizen" &&
      String(complaint.citizen._id) !==
        String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    let issue = null;

    if (complaint.issueGroupId) {
      issue = await Issue.findOne({
        issueGroupId:
          complaint.issueGroupId,
      }).select(
        "issueGroupId category issueType reportCount priority status location"
      );
    }

    return res.json({
      complaint,

      issue: issue
        ? {
            issueGroupId:
              issue.issueGroupId,

            category:
              issue.category,

            issueType:
              issue.issueType,

            reportCount:
              issue.reportCount,

            priority:
              issue.priority,

            status:
              issue.status,

            location:
              issue.location,
          }
        : null,
    });

  } catch (err) {
    console.error(
      "getComplaintById error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};


// =====================================================
// GET /api/complaints/nearby
// Officer
// =====================================================

exports.getNearbyIssues = async (
  req,
  res
) => {
  try {
    const officer =
      req.user;

    const filter = {
      status: {
        $ne: "Resolved",
      },
    };

    if (officer.department) {
      filter.category =
        officer.department;
    }

    const complaints =
      await Complaint.find(
        filter
      ).populate(
        "citizen",
        "fullName"
      );

    const withDistance =
      complaints
        .map((c) => ({
          complaint: c,

          distance: distanceKm(
            officer.location?.lat,
            officer.location?.lng,
            c.location.lat,
            c.location.lng
          ),
        }))
        .sort(
          (a, b) =>
            (a.distance ?? 999) -
            (b.distance ?? 999)
        );

    res.json({
      items:
        withDistance.map(
          ({
            complaint,
            distance,
          }) => ({
            ...complaint.toObject(),

            distanceKm:
              distance,
          })
        ),
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// =====================================================
// GET /api/complaints/assigned
// Officer
// =====================================================

exports.getAssignedComplaints =
  async (req, res) => {
    try {
      const complaints =
        await Complaint.find({
          assignedOfficer:
            req.user._id,
        })
          .populate(
            "citizen",
            "fullName"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        complaints,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// GET /api/complaints/map
// Officer
// =====================================================

exports.getMapComplaints =
  async (req, res) => {
    try {
      const complaints =
        await Complaint.find({
          status: {
            $ne: "Resolved",
          },
        }).populate(
          "citizen",
          "fullName"
        );

      const officer =
        req.user;

      const items =
        complaints.map((c) => ({
          ...c.toObject(),

          distanceKm:
            distanceKm(
              officer.location?.lat,
              officer.location?.lng,
              c.location.lat,
              c.location.lng
            ),
        }));

      res.json({
        items,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// PATCH /api/complaints/:id/accept
// =====================================================

exports.acceptComplaint =
  async (req, res) => {
    try {
      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found",
        });
      }

      complaint.assignedOfficer =
        req.user._id;

      complaint.status =
        "Assigned";

      complaint.timeline.push({
        status: "Assigned",

        note:
          `${req.user.fullName} (${req.user.designation || "Officer"}) accepted this case`,

        actor:
          req.user._id,
      });

      await complaint.save();

      await notify(
        complaint.citizen,

        "officer_assigned",

        "Officer assigned",

        `${req.user.fullName} (${req.user.designation || "Officer"}) is now handling ${complaint.complaintId}.`,

        complaint._id
      );

      res.json({
        complaint,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// PATCH /api/complaints/:id/status
// =====================================================

exports.updateStatus =
  async (req, res) => {
    try {
      const {
        status,
        note,
      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found",
        });
      }

      if (status) {
        complaint.status =
          status;
      }

      complaint.timeline.push({
        status:
          status ||
          complaint.status,

        note:
          note ||
          `Status updated to ${status}`,

        actor:
          req.user._id,
      });

      await complaint.save();

      await notify(
        complaint.citizen,

        status === "Under Review"
          ? "status_changed"
          : "officer_update",

        status
          ? `Status changed to ${status}`
          : "Officer updated your complaint",

        note ||
          `${complaint.complaintId} status changed to ${status}.`,

        complaint._id
      );

      res.json({
        complaint,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// PATCH /api/complaints/:id/resolve
// =====================================================

exports.resolveComplaint =
  async (req, res) => {
    try {
      const {
        note,
      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found",
        });
      }

      complaint.status =
        "Resolved";

      complaint.resolution = {
        note:
          note || "",

        photoUrl:
          req.file
            ? req.file.path
            : "",

        resolvedAt:
          new Date(),
      };

      complaint.timeline.push({
        status: "Resolved",

        note:
          note ||
          "Issue resolved",

        actor:
          req.user._id,
      });

      await complaint.save();

      await notify(
        complaint.citizen,

        "complaint_resolved",

        "Complaint resolved",

        `${complaint.complaintId} — ${complaint.title} has been resolved. Please rate the resolution.`,

        complaint._id
      );

      res.json({
        complaint,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// PATCH /api/complaints/:id/rate
// =====================================================

exports.rateComplaint =
  async (req, res) => {
    try {
      const {
        rating,
        comment,
      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found",
        });
      }

      if (
        String(complaint.citizen) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      complaint.rating =
        rating;

      complaint.ratingComment =
        comment || "";

      await complaint.save();

      await notify(
        req.user._id,

        "feedback_thanks",

        "Thanks for your feedback",

        `You rated the resolution of ${complaint.complaintId} ${rating} stars.`,

        complaint._id
      );

      res.json({
        complaint,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// GET /api/complaints/stats/citizen
// =====================================================

exports.citizenStats =
  async (req, res) => {
    try {
      const complaints =
        await Complaint.find({
          citizen:
            req.user._id,
        });

      const stats = {
        total:
          complaints.length,

        pending:
          complaints.filter(
            (c) =>
              [
                "Submitted",
                "Under Review",
              ].includes(c.status)
          ).length,

        inProgress:
          complaints.filter(
            (c) =>
              [
                "Assigned",
                "In Progress",
              ].includes(c.status)
          ).length,

        resolved:
          complaints.filter(
            (c) =>
              c.status ===
              "Resolved"
          ).length,
      };

      res.json({
        stats,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// GET /api/complaints/stats/officer
// =====================================================

exports.officerStats =
  async (req, res) => {
    try {
      const assigned =
        await Complaint.find({
          assignedOfficer:
            req.user._id,
        });

      const now =
        new Date();

      const stats = {
        assigned:
          assigned.length,

        newComplaints:
          assigned.filter(
            (c) =>
              c.status ===
              "Assigned"
          ).length,

        inProgress:
          assigned.filter(
            (c) =>
              c.status ===
              "In Progress"
          ).length,

        resolved:
          assigned.filter(
            (c) =>
              c.status ===
              "Resolved"
          ).length,

        overdue:
          assigned.filter(
            (c) =>
              c.slaDeadline &&
              c.slaDeadline < now &&
              c.status !==
                "Resolved"
          ).length,
      };

      res.json({
        stats,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// GET /api/complaints/public/recent
// =====================================================

exports.getPublicRecent =
  async (req, res) => {
    try {
      const complaints =
        await Complaint.find({})
          .sort({
            createdAt: -1,
          })
          .limit(6)
          .select(
            "complaintId title category status priority location createdAt"
          );

      res.json({
        complaints,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };


// =====================================================
// GET /api/complaints/public/category-counts
// =====================================================

exports.getCategoryCounts =
  async (req, res) => {
    try {
      const counts =
        await Complaint.aggregate([
          {
            $match: {
              status: {
                $ne: "Resolved",
              },
            },
          },

          {
            $group: {
              _id: "$category",

              count: {
                $sum: 1,
              },
            },
          },
        ]);

      res.json({
        counts,
      });

    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };