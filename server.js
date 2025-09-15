// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Store pending approvals
export const pendingApprovals = {}; // { email: { status: 'pending'|'accepted'|'rejected' } }

// Endpoint for frontend to send login requests
app.post("/send-login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ error: "Missing email" });

  // Mark email as pending
  pendingApprovals[email] = { status: "pending" };

  res.json({ status: "ok" });
});

// Endpoint for frontend to poll approval status
app.post("/check-status", (req, res) => {
  const { email } = req.body;
  if (!email || !pendingApprovals[email]) return res.json({ status: "pending" });
  res.json({ status: pendingApprovals[email].status });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
