import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { startBot, setApprovalsStore } from "./bot.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// In-memory approvals store
const approvals = {};
setApprovalsStore(approvals);

// Start Telegram bot
startBot();

// POST /demo-login
app.post("/demo-login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  const identifier = Math.random().toString(36).substring(2, 10); // unique ID
  approvals[identifier] = { email, status: "pending" };

  // Send message to Telegram admin
  const message = `Demo login request:\nEmail: ${email}\nIdentifier: ${identifier}\nApprove or Reject?`;
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "✅ Accept", callback_data: `accept_${identifier}` },
        { text: "❌ Reject", callback_data: `reject_${identifier}` }
      ]
    ]
  };

  try {
    startBot().bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, message, { reply_markup: inlineKeyboard });
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }

  res.json({ success: true, identifier });
});

// GET /check-status?identifier=...
app.get("/check-status", (req, res) => {
  const { identifier } = req.query;
  if (!identifier || !approvals[identifier]) return res.json({ status: "unknown" });
  res.json({ status: approvals[identifier].status });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
