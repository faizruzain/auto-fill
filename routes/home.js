const express = require("express");
const router = express.Router();

router.route("/").get((req, res) => {
  res.send({ message: `hello ${req.socket.remoteAddress}` });
});

module.exports = router;
