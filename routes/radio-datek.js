const express = require("express");
const router = express.Router();

const RadioDatek = require("../schemas/radio-datek");

router
  .route("/")
  .get(async (req, res) => {
    // console.log(req.query);
    const NE = req.query.NE;
    const FE = req.query.FE;
    // console.log("radio-datek");

    const conditions = {
      "NE.actNeSiteid": NE,
      "FE.actFeSiteid": FE,
    };

    try {
      const doc = await RadioDatek.findOne(conditions).lean().exec();

      if (doc) {
        res.status(200).send(doc);
      } else if (!doc) {
        res.status(200).send({ message: "No data" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Bad request" });
    }
  })
  .post(async (req, res) => {
    // console.log(req.body);
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
      } else if (doc) {
        console.log(doc);
        res.status(200).send({ message: "Data exist" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Bad request" });
    }
  });

module.exports = router;
