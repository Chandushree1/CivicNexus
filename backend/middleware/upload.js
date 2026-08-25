const multer = require("multer");
const { complaintStorage, resolutionStorage, avatarStorage } = require("../config/cloudinary");

const uploadComplaintPhotos = multer({
  storage: complaintStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per file
}).array("photos", 5);

const uploadResolutionPhoto = multer({
  storage: resolutionStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
}).single("resolutionPhoto");

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("avatar");

module.exports = { uploadComplaintPhotos, uploadResolutionPhoto, uploadAvatar };
