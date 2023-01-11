// ======================================= dotenv for security =======================================
require("dotenv").config();
// import dotenv from 'dotenv'
// dotenv.config()
// ======================================= dotenv for security =======================================

const NossaVersion = "4.1";
const OneDigitOrSatriaVersion = "3.7";

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
mongoose.set("strictQuery", false);
// const db = "mongodb://127.0.0.1:27017/test";
const db = process.env.DB
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(db);
}
// ======================================== db configuration ========================================

// home route
app.get("/", (req, res) => {
  res.send({ message: `hello ${req.ip}` });
});

app.get("/list", (req, res) => {
  console.log(req.query.id);
  if (req.query.id) {
    // get a doc by ticketId or remedy
    const query = req.query.id;
    const doc = Ticket.findOne({
      $or: [{ ticketId: query }, { remedy: query }],
    })
      .lean()
      .exec();

    doc.then((doc) => {
      if (!doc) {
        res.send({ message: "no data found" });
      } else {
        res.send(doc);
      }
    });
  } else if (req.query.regtsel) {
    // filter docs by regtsel[num]
    const query = req.query.regtsel;
    const regex = new RegExp(`regtsel${query}(?![0-1])`, "i");
    const docs = Ticket.find({ ticketHL: regex }).lean().exec();

    docs.then((docs) => {
      if (docs.length === 0) {
        res.send({ message: "no data found" });
      } else if (docs) {
        res.send(docs);
      }
    });
  } else if (req.query.date) {
    // filter docs by date
    const dateRegex = new RegExp(req.query.date, "i");
    const datePatt = /\d{2}-\d{2}-\d{4}/;
    const validDate = datePatt.test(req.query.date);

    if (!validDate) {
      res.send({ message: "invalid date" });
    } else if (validDate) {
      const docs = Ticket.find({ dateOpen: dateRegex }).lean().exec();

      docs.then((docs) => {
        if (docs.length === 0) {
          res.send({ message: "no data found" });
        } else {
          res.send(docs);
        }
      });
    }
  } else {
    // get all docs
    const docs = Ticket.find({}).lean().exec();

    docs.then((docs) => {
      res.send(docs);
    });
  }
});

app.get("/list/:hl", (req, res) => {
  const regtsel = req.query.regtsel;
  const date = req.query.date;
  const typeRegex = new RegExp(req.params.hl, "i");
  const typeAndRegtselRegex = new RegExp(
    `(?=.*${req.params.hl})(?=.*regtsel${regtsel}(?![0-1]))`,
    "i"
  );

  if (!regtsel && !date) {
    // if no query which is regtsel[num]
    const docs = Ticket.find({ ticketHL: typeRegex }).lean().exec();

    docs.then((docs) => {
      if (docs.length === 0) {
        res.send({ message: "no data found" });
      } else if (docs) {
        res.send(docs);
      }
    });
  } else if (regtsel) {
    // with query and params
    const docs = Ticket.find({ ticketHL: typeAndRegtselRegex }).lean().exec();

    docs.then((docs) => {
      if (docs.length === 0) {
        res.send({ message: "no data found" });
      } else if (docs) {
        res.send(docs);
      }
    });
  } else if (date) {
    // filter docs by type and date open
    const dateRegex = new RegExp(req.query.date, "i");
    const datePatt = /\d{2}-\d{2}-\d{4}/;
    const validDate = datePatt.test(date);

    if (!validDate) {
      res.send({ message: "invalid date" });
    } else if (validDate) {
      const docs = Ticket.find({
        $and: [{ ticketHL: typeRegex }, { dateOpen: dateRegex }],
      })
        .lean()
        .exec();

      docs.then((docs) => {
        if (docs.length === 0) {
          res.send({ message: "no data found" });
        } else {
          res.send(docs);
        }
      });
    }
  }
});

app.put("/list", cors(corsOptions), (req, res) => {
  const version = req.body.version;
  if (version === NossaVersion) {
    const filter = {
      ticketId: req.body.ticketId,
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

app.listen(port);
