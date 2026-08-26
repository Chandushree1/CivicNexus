const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/chatbotController");

// Any logged-in user can chat; only citizens can successfully file a complaint
// through it (enforced inside the controller).
router.post("/message", protect, ctrl.sendMessage);

module.exports = router;
