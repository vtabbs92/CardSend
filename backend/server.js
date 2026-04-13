require('dotenv').config();
require('./keepalive');
const express  = require('express');
const cors     = require('cors');

const repRoutes     = require('./routes/reps');
const contactRoutes = require('./routes/contacts');
const smsRoutes     = require('./routes/sms');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/reps',     repRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sms',      smsRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () =>
  console.log(`CardSend API running on http://localhost:${PORT}`)
);
