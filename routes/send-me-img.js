const express = require("express");
const router = express.Router();
const bot = require("../telegram-bot/bot");
const multer = require("multer");

const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./evidence");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now();
//     var extension = file.mimetype;
//     extension = extension.split("/")[1];
//     cb(null, req.body.ticketId + "-" + uniqueSuffix + "." + extension);
//   },
// });

const upload = multer({ storage: storage });
// const { unlink } = require("node:fs/promises");

router
  .route("/")
  .get(async (req, res) => {
    try {
      await bot.sendMessage("830056518", "hello form web!");
      res.status(200).send({ message: "Telegram Bot" });
    } catch (error) {
      console.log("error");
      console.log(error);
      res.status(400).send({ message: error });
    }
  })
  .post(upload.single("evidence"), async (req, res) => {
    console.log(req.file);
    console.log(req.body.ticketId);
    const buffer = req.file.buffer;
    // const path = req.file.path;
    // res.status(200).send({ message: "Got your data" });
    try {
      await bot.sendPhoto("830056518", buffer);
      // await unlink(path);
      // console.log(`successfully deleted ${path}`);
      res.status(200).send({ message: "Got your data" });
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "???" });
    }
  });

module.exports = router;
