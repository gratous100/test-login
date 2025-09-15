// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory store { email: status }
const loginDecisions = {};

// Called by bot.js when decision is made
app.post("/update-status", (req, res) => {
  const { email, status } = req.body;
  if (!email || !status) {
    return res.status(400).json({ error: "Missing email or status" });
  }
  loginDecisions[email] = status;
  res.json({ success: true });
});

// Frontend polls here
app.post("/check-status", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const status = loginDecisions[email] || "pending";
  res.json({ status });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
