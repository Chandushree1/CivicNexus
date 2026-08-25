const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const ctrl = require("../controllers/userController");

router.get("/profile", protect, ctrl.getProfile);
router.put("/profile", protect, uploadAvatar, ctrl.updateProfile);
router.put("/change-password", protect, ctrl.changePassword);

module.exports = router;
