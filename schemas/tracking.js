const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema(
  {
    service: String,
    total: Number,
  },
  {
    collection: "tracking",
  }
);

const Tracking = mongoose.model("Tracking", trackingSchema);
module.exports = Tracking;
