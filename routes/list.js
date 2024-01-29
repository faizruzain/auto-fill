const express = require("express");
const router = express.Router();
const cors = require("cors");

const Ticket = require("../schemas/ticket");

const InseraVersion = "1.0";

const corsOptions = {
  methods: "PUT",
  allowedHeaders: {
    "Content-Type": "application/json",
  },
};

// get ticket details
router
  .route("/")
  .get(async (req, res) => {
    const query = req.query.id;

    if (query) {
      try {
        const doc = await Ticket.findOne({ ticketId: query }).lean().exec();

        if (!doc) {
          res.status(200).send({ message: "no data found" });
        } else if(doc) {
          await Ticket.deleteMany({ ticketId: query });
          res.status(200).send(doc);
        }
      } catch (error) {
        res.status(403).send(error);
      }
    } else {
      res.status(200).send({ status: "working" });
    }
  })
  .put(cors(corsOptions), async (req, res) => {
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

module.exports = router;
