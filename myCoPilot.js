// ======================================= dotenv for security =======================================
require("dotenv").config();
// import dotenv from 'dotenv'
// dotenv.config()
// ======================================= dotenv for security =======================================

const NossaVersion = "4.1";

// =================================== express server configuration ===================================
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
// to catch incoming POST data
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const corsOptions = {
  methods: "PUT",
  allowedHeaders: {
    "Content-Type": "application/json",
  },
};
// =================================== express server configuration ===================================

// ======================================== db configuration ========================================
// my schemas
const Ticket = require("./schemas/ticket.js");
// my schemas

const mongoose = require("mongoose");
// const { query } = require("express");
mongoose.set("strictQuery", false);
const db = "mongodb://127.0.0.1:27017/test";
// const db = process.env.DB;
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(db);
}
// ======================================== db configuration ========================================

// home route
app.get("/", (req, res) => {
  res.send({ message: `hello ${req.ip}` });
});

// to do queries
app.get("/list", async (req, res) => {
  const query = req.query.id;

  if (query) {
    const doc = await Ticket.findOne({ ticketId: query }).lean().exec();

    if (!doc) {
      res.status(200).send({ message: "no data found" });
    } else {
      await res.status(200).send(doc);
      await Ticket.deleteMany({ ticketId: query });
    }
  } else {
    res.status(200).send({ status: "working" });
  }
});

app.put("/list", cors(corsOptions), (req, res) => {
  const version = req.body.version;
  const query = req.body.ticketId;
  if (version === NossaVersion) {
    const filter = {
      ticketId: query,
    };

    const update = {
      actualSolution: req.body.actualSolution,
      incidentDomain: req.body.incidentDomain,
      RFO_details: req.body.RFO_details,
      dateClosed: req.body.dateClosed,
    };

    const doc = Ticket.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    })
      .lean()
      .exec();

    doc.then((doc) => {
      if (doc) {
        res.status(200).send(doc);
      }
    });
  } else {
    res.status(403).send({ message: "need update!" });
  }
});

// input new ticket
app.post("/addlist", (req, res) => {
  // adds new ticket
  const version = req.body.version;
  if (version === NossaVersion) {
    Ticket.findOne({ ticketId: req.body.ticketId }, { lean: true }).exec(
      (err, doc) => {
        if (err) {
          res.send(err);
        } else if (doc) {
          // if there is a match, update doc with new update
          const filter = {
            ticketId: req.body.ticketId,
          };

          const update = {
            ticketId: req.body.ticketId,
            ticketHL: req.body.ticketHL,
            dateOpen: req.body.dateOpen,
            remedy: req.body.remedy,
            impact: req.body.impact,
            datek: req.body.datek,
          };

          const options = {
            returnDocument: "after",
            lean: true,
          };

          Ticket.findOneAndUpdate(filter, update, options, (error, doc) => {
            if (error) {
              res.send(err);
            } else {
              res.send({ message: `updated this ${doc.ticketId}` });
            }
          });
        } else {
          // if there is no match, create one
          const data = new Ticket({
            ticketId: req.body.ticketId,
            ticketHL: req.body.ticketHL,
            dateOpen: req.body.dateOpen,
            remedy: req.body.remedy,
            impact: req.body.impact,
            datek: req.body.datek,
          });

          data.set("validateBeforeSave", false);

          data.validate((err) => {
            if (err) {
              res.send(err.errors);
            } else {
              data.save();
              res.send({ message: "success" });
            }
          });
        }
      }
    );
  } else {
    res.status(403).send({ message: "need update!" });
  }
});

app.get("*", (req, res) => {
  res.status(200).send("<h1>Path not found</h1>");
});

app.listen(port);
