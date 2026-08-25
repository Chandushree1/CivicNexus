const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for complaint evidence photos (up to 5 per complaint)
const complaintStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "civicconnect/complaints",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
  },
});

// Storage for resolution photos uploaded by officers
const resolutionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "civicconnect/resolutions",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
  },
});

// Storage for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "civicconnect/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

module.exports = { cloudinary, complaintStorage, resolutionStorage, avatarStorage };
