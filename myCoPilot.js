// ======================================= dotenv for security =======================================
require("dotenv").config();
// import dotenv from 'dotenv'
// dotenv.config()
// ======================================= dotenv for security =======================================

const InseraVersion = "4.1";

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

main();

async function main() {
  try {
    await mongoose.connect(db);
  } catch(err) {
    console.log(err);
  }
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
    try {
      const doc = await Ticket.findOne({ ticketId: query }).lean().exec();

      if (!doc) {
        res.status(200).send({ message: "no data found" });
      } else {
        res.status(200).send(doc);
        await Ticket.deleteMany({ ticketId: query });
      }
    } catch (error) {
      res.status(403).send(error);
    }
  } else {
    res.status(200).send({ status: "working" });
  }
});

// update ticket
app.put("/list", cors(corsOptions), async (req, res) => {
  const version = req.body.version;
  const query = req.body.ticketId;
  if (version === InseraVersion) {
    const filter = {
      ticketId: query,
    };

    const update = {
      ticketHL: req.body.ticketHL,
      actualSolution: req.body.actualSolution,
      incidentDomain: req.body.incidentDomain,
      RFO_details: req.body.RFO_details,
      dateClosed: req.body.dateClosed,
      ttr_customer: req.body.ttr_customer,
    };

    try {
      const doc = await Ticket.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
      })
        .lean()
        .exec();
      if (doc) {
        res.status(200).send(doc);
      }
    } catch (error) {
      res.status(403).send(error);
    }
  } else {
    res.status(403).send({ message: "need update!" });
  }
});

// input new ticket
app.post("/addlist", async (req, res) => {
  // adds new ticket
  const version = req.body.version;
  if (version === InseraVersion) {
    Ticket.findOne({ ticketId: req.body.ticketId }, { lean: true }).then(
      async (err, doc) => {
        if (err) {
          res.status(403).send(err);
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

          try {
            await data.save();
            res.status(200).send({ message: "success" });
          } catch (error) {
            res.status(403).send(error.errors);
          }
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

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
