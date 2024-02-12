const express = require("express");
const router = express.Router();

const RadioDatek = require("../schemas/radio-datek");

router
  .route("/")
  .get(async (req, res) => {
    const NE = req.query.NE;
    const FE = req.query.FE;

    const conditions = {
      "NE.actNeSiteid": NE,
      "FE.actFeSiteid": FE,
    };

    try {
      const doc = await RadioDatek.findOneAndDelete(conditions).lean().exec();

      if (doc) {
        res.status(200).send(doc);
      } else if (!doc) {
        res.status(200).send({ message: "No data" });
      }
    } catch (error) {
      res.status(400).send({ message: "Bad request" });
    }
  })
  .post(async (req, res) => {
    const NE = req.body.NE;
    const FE = req.body.FE;

    const conditions = {
      "NE.actNeSiteid": req.body.NE.actNeSiteid,
      "FE.actFeSiteid": req.body.FE.actFeSiteid,
    };

    try {
      const doc = await RadioDatek.findOne(conditions).lean().exec();

      if (!doc) {
        const newData = new RadioDatek({
          NE: NE,
          FE: FE,
        });

        await newData.save();
        res.status(200).send({ message: "Data saved" });
      } else if (doc) {
        res.status(200).send({ message: "Data exist" });
      }
    } catch (error) {
      res.status(400).send({ message: "Bad request" });
    }
  });

module.exports = router;
