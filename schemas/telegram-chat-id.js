const mongoose = require("mongoose");

const telegramChatIdSchema = new mongoose.Schema(
  {
    message_id: Number,
    from: {},
    chat: {},
    date: Number,
    text: String,
    entities: Array,
  },
  {
    collection: "telegramChatId",
  }
);

const TelegramChatId = mongoose.model(
  "telegramChatIdSchema",
  telegramChatIdSchema
);

module.exports = TelegramChatId;
