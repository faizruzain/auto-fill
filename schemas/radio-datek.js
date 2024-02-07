const mongoose = require("mongoose");

const radioDatekSchema = new mongoose.Schema(
  {
    NE: Object,
    FE: Object,
  },
  {
    collection: "radioDatek",
  }
);

// compiling Schema to Model
const RadioDatek = mongoose.model("RadioDatek", radioDatekSchema);
module.exports = RadioDatek;
