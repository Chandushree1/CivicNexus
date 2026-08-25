const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["citizen", "officer", "admin"], default: "citizen" },
    address: { type: String, trim: true },
    city: { type: String, trim: true, default: "Bengaluru" },
    avatarUrl: { type: String, default: "" },

    // Officer-specific fields
    designation: { type: String, trim: true }, // e.g. "Junior Engineer"
    department: {
      type: String,
      enum: [
        "Roads & Potholes",
        "Garbage",
        "Streetlights",
        "Drainage",
        "Water Supply",
        "Public Facilities",
        "Parks",
        "Electricity",
        "Other",
      ],
    },
    ward: { type: String, trim: true }, // e.g. "Ward 84, Koramangala"
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isActive: { type: Boolean, default: true },
    createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
