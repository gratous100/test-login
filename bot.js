import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

let approvals = {}; // Will be imported/set by server.js

export function setApprovalsStore(store) {
  approvals = store;
}

// Start the bot
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

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
