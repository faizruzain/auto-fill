const express = require("express");
const router = express.Router();

const InseraVersion = "1.0";

const Worklogs = require("../schemas/worklogs.js");

router
  .route("/")
  .get(async (req, res) => {
    const query = req.query.ticketId;

    if (query) {
      try {
        const doc = await Worklogs.findOne({ ticketId: query }).lean().exec();

        if (!doc) {
          res.status(200).send({ message: "no data found" });
        } else {
          res.status(200).send(doc);
          await Worklogs.deleteMany({ ticketId: query });
        }
      } catch (error) {
        res.status(403).send(error);
      }
    } else {
      res.status(200).send({ status: "working" });
    }
  })
  .post(async (req, res) => {
    const version = req.body.version;
    const ticketId = req.body.ticketId;
    const worklogs = req.body.worklogs;

    if (version === InseraVersion) {
      try {
        const doc = await Worklogs.findOne({ ticketId: ticketId })
          .lean()
          .exec();
        // if no data found, create new doc
        if (!doc) {
          const data = new Worklogs({
            ticketId: ticketId,
            worklogs: worklogs,
          });
          try {
            await data.save();
            res.status(200).send({ message: "update worklogs success" });
          } catch (err) {
            res.status(403).send(err.errors);
          }
        } else if (doc) {
          const filter = {
            ticketId: ticketId,
          };

          const update = {
            worklogs: worklogs,
          };

          const options = {
            returnDocument: "after",
            lean: true,
          };

          try {
            const doc = await Worklogs.findOneAndUpdate(filter, update, options)
              .lean()
              .exec();
            res.status(200).send({ message: `updated this ${doc.ticketId}` });
          } catch (err) {
            res.status(403).send(err);
          }
        }
      } catch (err) {
        res.status(403).send(err.errors);
      }
    } else {
      res.status(200).send({ message: "need update!" });
    }
  });

module.exports = router;
