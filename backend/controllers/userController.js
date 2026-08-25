const bcrypt = require("bcryptjs");
const User = require("../models/User");

// @route GET /api/users/profile
exports.getProfile = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// @route PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (req.file) user.avatarUrl = req.file.path;

    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
