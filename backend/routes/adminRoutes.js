const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/overview", ctrl.getOverview);
router.get("/complaints", ctrl.getAllComplaints);
router.patch("/complaints/:id/assign", ctrl.reassignComplaint);

router.get("/officers", ctrl.getOfficers);
router.post("/officers", ctrl.createOfficer);
router.put("/officers/:id", ctrl.updateOfficer);
router.delete("/officers/:id", ctrl.deleteOfficer);

router.get("/citizens", ctrl.getCitizens);

router.get("/analytics/wards", ctrl.getWardAnalytics);
router.get("/analytics/categories", ctrl.getCategoryAnalytics);

module.exports = router;
