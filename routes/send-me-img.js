require("dotenv").config();
const express = require("express");
const router = express.Router();
const bot = require("../telegram-bot/bot");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const chatId = process.env.FAIZRUZAIN || process.env.EOS_CSO_TELEGRAM_CHAT_ID;

router
  .route("/")
  .get(async (req, res) => {
    try {
      await bot.sendMessage(chatId, "hello form web!");
      res.status(200).send({ message: "Telegram Bot" });
    } catch (error) {
      await bot.sendMessage(chatId, error);
      res.status(400).send({ message: error });
    }
  })
  .post(upload.single("evidence"), async (req, res) => {
    const buffer = req.file.buffer;
    try {
      // await bot.sendMessage(chatId, ticketId);
      await bot.sendPhoto(chatId, buffer);
      res.status(200).send({ message: "Got your data" });
    } catch (error) {
      console.log(error);
      await bot.sendMessage(chatId, error);
      res.status(400).send({ message: "???" });
    }
  });

module.exports = router;
