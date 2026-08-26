const dns = require("dns")
// {
//   "issueType": "exposed_electrical_wire",
//   "severity": "critical",
//   "confidence": 0.96,
//   "hazards": [],
//   "suggestedCategory": "Electricity",
//   "categoryMismatch": false
// }

// Latitude: 13.0688
// Longitude: 77.5567
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
