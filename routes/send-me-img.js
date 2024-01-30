require("dotenv").config();
const express = require("express");
const router = express.Router();
const cors = require("cors");
const bot = require("../telegram-bot/bot");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const chatId = process.env.FAIZRUZAIN
  ? process.env.FAIZRUZAIN
  : process.env.EOS_CSO_TELEGRAM_CHAT_ID;

router
  .route("/")
  .get(async (req, res) => {
    try {
      await bot.sendMessage(chatId, "hello from web!");
      res.status(200).send({ message: "Telegram Bot" });
    } catch (error) {
      await bot.sendMessage(chatId, error);
      res.status(400).send({ message: error });
    }
  })
  .post(upload.any(), cors(), async (req, res) => {
    console.log(req.body);
    const header = req.body.header;
    const details = req.body.details;
    const files = req.files;
    var mediaGroup = [];

    const populateMediaGroup = new Promise((resolve, reject) => {
      for (var i = 0; i < files.length; i++) {
        const media = new Object();
        media.type = "photo";
        media.media = files[i].buffer;
        //media.caption = header;
        mediaGroup.push(media);
      }
      resolve(mediaGroup);
      reject("error");
    });

    if (files.length === 0) {
      res.status(200).send({ message: "No images" });
    } else if (files.length === 1) {
      try {
        await bot.sendPhoto(chatId, files[0].buffer, {
          caption: header + "\n" + "\n" + details
        });
        res.status(200).send({ message: "got your data :)" });
      } catch (err) {
        console.log(err);
        res.status(400).send({ message: "something's not right :(" });
      }
    } else if (files.length > 1) {
      populateMediaGroup.then(async (val, err) => {
        if (val) {
          try {
            console.log(val);
            await bot.sendMediaGroup(chatId, mediaGroup, {
              caption: header + "\n" + "\n" + details
            });
            res.status(200).send({ message: "got your data :)" });
          } catch (error) {
            console.log(error);
            res.status(400).send({ message: "something's not right :(" });
          }
        } else if (err) {
          console.log(err);
          res.status(400).send({ message: "something's not right :(" });
        }
      });
    }
  });
// .post(upload.single("evidence"), cors(), async (req, res) => {
//   const buffer = req.file.buffer;
//   try {
//     await bot.sendPhoto(chatId, buffer);
//     res.status(200).send({ message: "Got your data" });
//   } catch (error) {
//     console.log(error);
//     await bot.sendMessage(chatId, error);
//     res.status(400).send({ message: "???" });
//   }
// });

module.exports = router;
