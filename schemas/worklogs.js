const mongoose = require("mongoose");

const worklogsSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
    },
    worklogs: {
      type: [Array],
    },
  },
  {
    collection: "worklogs",
  }
);

// compiling Schema to Model
const Worklogs = mongoose.model("Worklogs", worklogsSchema);
module.exports = Worklogs;
