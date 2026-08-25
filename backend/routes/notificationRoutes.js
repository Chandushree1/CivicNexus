const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/notificationController");

router.get("/", protect, ctrl.getMyNotifications);
router.patch("/:id/read", protect, ctrl.markAsRead);
router.patch("/read-all", protect, ctrl.markAllAsRead);

module.exports = router;
