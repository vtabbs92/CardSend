// Keep Render free tier awake by pinging every 10 minutes
const https = require('https');

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'https://cardsend-backend.onrender.com';

function ping() {
  https.get(`${BACKEND_URL}/health`, (res) => {
    console.log(`[keepalive] ping ${new Date().toISOString()} — status ${res.statusCode}`);
  }).on('error', (e) => {
    console.log(`[keepalive] ping failed: ${e.message}`);
  });
}

// Ping every 10 minutes
setInterval(ping, 10 * 60 * 1000);
console.log('[keepalive] Started — pinging every 10 minutes');

module.exports = { ping };
