import { Telegraf } from "telegraf";
import dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
let approvals = {};

export function setApprovalsStore(store) {
  Object.assign(approvals, store);
}

export function startBot() {
  bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (!data) return;

    const [action, identifier] = data.split("_");
    if (!approvals[identifier]) {
      return ctx.answerCbQuery("Identifier not found").catch(() => {});
    }

    if (action === "accept") {
      approvals[identifier].status = "accepted";
      await ctx.editMessageText(`✅ Approved: ${approvals[identifier].email}`);
    } else if (action === "reject") {
      approvals[identifier].status = "rejected";
      await ctx.editMessageText(`❌ Rejected: ${approvals[identifier].email}`);
    } else {
      await ctx.answerCbQuery("Unknown action");
    }
  });

  bot.launch().then(() => console.log("Telegram bot running..."));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Function to send new approval message
export async function sendApprovalRequest(email, identifier) {
  const chatId = process.env.CHAT_ID;
  const url = `${process.env.APP_URL}/`; // Your Render server URL
  approvals[identifier] = { email, status: "pending" };

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Accept", callback_data: `accept_${identifier}` },
        { text: "❌ Reject", callback_data: `reject_${identifier}` }
      ]
    ]
  };

  await bot.telegram.sendMessage(
    chatId,
    `New login request:\nEmail: ${email}\nApprove or Reject?`,
    { reply_markup: keyboard }
  );
}

