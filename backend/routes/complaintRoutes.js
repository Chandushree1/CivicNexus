const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { uploadComplaintPhotos, uploadResolutionPhoto } = require("../middleware/upload");
const ctrl = require("../controllers/complaintController");

// Public
router.get("/public/recent", ctrl.getPublicRecent);
router.get("/public/category-counts", ctrl.getCategoryCounts);

// Citizen
router.post("/", protect, authorize("citizen"), uploadComplaintPhotos, ctrl.createComplaint);
router.get("/mine", protect, authorize("citizen"), ctrl.getMyComplaints);
router.get("/stats/citizen", protect, authorize("citizen"), ctrl.citizenStats);
router.patch("/:id/rate", protect, authorize("citizen"), ctrl.rateComplaint);

// Officer
router.get("/nearby", protect, authorize("officer", "admin"), ctrl.getNearbyIssues);
router.get("/assigned", protect, authorize("officer", "admin"), ctrl.getAssignedComplaints);
router.get("/map", protect, authorize("officer", "admin"), ctrl.getMapComplaints);
router.get("/stats/officer", protect, authorize("officer", "admin"), ctrl.officerStats);
router.patch("/:id/accept", protect, authorize("officer", "admin"), ctrl.acceptComplaint);
router.patch("/:id/status", protect, authorize("officer", "admin"), ctrl.updateStatus);
router.patch(
  "/:id/resolve",
  protect,
  authorize("officer", "admin"),
  uploadResolutionPhoto,
  ctrl.resolveComplaint
);

// Shared (must be last so it doesn't shadow the specific routes above)
router.get("/:id", protect, ctrl.getComplaintById);

module.exports = router;
