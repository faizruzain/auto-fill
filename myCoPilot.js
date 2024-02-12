// ======================================= dotenv for security =======================================
require("dotenv").config();
// ======================================= dotenv for security =======================================

// =================================== express server configuration ===================================
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");

// routes
const homeRoute = require("./routes/home.js");
const listRoute = require("./routes/list.js");
const addlistRoute = require("./routes/addlist.js");
const updateworklogsRoute = require("./routes/update-worklogs.js");
const sendMeImg = require("./routes/send-me-img.js");
const radioDatek = require("./routes/radio-datek.js");

app.use(
  require("express-status-monitor")({
    spans: [
      {
        interval: 1,
        retention: 60,
      },
    ],
  })
);
// to catch incoming POST data
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/", express.static(path.join(__dirname, "public")), homeRoute);
app.use("/list", listRoute);
app.use("/addlist", addlistRoute);
app.use("/update-worklogs", updateworklogsRoute);
app.use("/send-me-img", sendMeImg);
app.use("/radio-datek", radioDatek);
// app.use(express.static(path.join(__dirname, "public")));
// =================================== express server configuration ===================================

// ======================================== db configuration ==========================================
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const local = "mongodb://127.0.0.1:27017/auto-fill-local";
const db = process.env.DB || local;

main();

async function main() {
  try {
    await mongoose.connect(db);
  } catch (err) {
    console.log(err);
  }
}

// ======================================== db configuration ========================================

app.get("*", (req, res) => {
  res.send("<h1>page not found!</h1>");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
