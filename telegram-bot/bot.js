require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN_LOCAL ? process.env.TELEGRAM_BOT_TOKEN_LOCAL : process.env.TELEGRAM_BOT_TOKEN_PRODUCTION;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const chatId = process.env.FAIZRUZAIN ? process.env.FAIZRUZAIN : process.env.EOS_CSO_TELEGRAM_CHAT_ID;

bot.onText(/\/sendhere/, async (msg, match) => {
  bot.sendMessage(chatId, "OK");
});

bot.onText(/\/chatid/, (msg, match) => {
  bot.sendMessage(chatId, chatId);
});

// bot.on("message", (msg) => {
//   console.log(msg);
//   const photos = msg.photo;
//   console.log("number of photos: "+photos.length+"\n");
//   for(var i = 0; i < photos.length; i++){
//     console.log(photos[i].file_unique_id);
//   }
// });

// bot.on("polling_error", (error) => {
//   console.log(error);
// });

module.exports = bot;
