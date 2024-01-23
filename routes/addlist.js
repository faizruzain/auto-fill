const express = require("express");
const router = express.Router();

const Ticket = require("../schemas/ticket");

const InseraVersion = "1.0";

// input new ticket
router.post("/", async (req, res) => {
  // adds new ticket
  const version = req.body.version;
  const ticketId = req.body.ticketId;
  if (version === InseraVersion) {
    try {
      const doc = await Ticket.findOne({ ticketId: ticketId }).lean().exec();
      if (!doc) {
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

        try {
          const doc = await Ticket.findOneAndUpdate(filter, update, options)
            .lean()
            .exec();
          res.status(200).send({ message: `updated this ${doc.ticketId}` });
        } catch (err) {
          res.status(403).send(err);
        }
      }
    } catch (err) {
      console.log(err);
      res.status(403).send(err);
    }
  } else {
    res.status(403).send({ message: "need update!" });
  }
});

module.exports = router;
