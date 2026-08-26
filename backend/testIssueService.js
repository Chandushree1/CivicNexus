const {
  calculateDistance
} = require("./services/issueService");

const distance = calculateDistance(
  12.97160,
  77.59450,
  12.97163,
  77.59453
);

console.log("Distance:", distance, "meters");