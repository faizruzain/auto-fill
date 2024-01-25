const express = require("express");
const router = express.Router();
const bot = require("../telegram-bot/bot");

router
  .route("/")
  .get(async (req, res) => {
    try {
      await bot.sendMessage("830056518", "url");
    } catch (error) {
      console.log("error");
      console.log(error);
    }
    res.status(200).send({ message: "Telegram Bot" });
  })
  .post(async (req, res) => {
    console.log(req.body);
    const urls = req.body.urls;
    try {
      await bot.sendPhoto("830056518", urls[0]);
    } catch (error) {
      console.log(error);
    }
    res.status(200).send({ message: "Got your data" });
  });

module.exports = router;
