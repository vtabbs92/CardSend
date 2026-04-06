const express  = require('express');
const router   = express.Router();
const twilio   = require('twilio');
const supabase = require('../lib/supabase');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── POST /api/sms/send  — send card + save contact ───────────
router.post('/send', async (req, res, next) => {
  try {
    const { rep_id, customer_name, customer_phone } = req.body;

    if (!rep_id)         return res.status(400).json({ error: 'rep_id is required' });
    if (!customer_name)  return res.status(400).json({ error: 'customer_name is required' });
    if (!customer_phone) return res.status(400).json({ error: 'customer_phone is required' });

    // 1. Fetch rep profile to build the SMS body
    const { data: rep, error: repErr } = await supabase
      .from('reps')
      .select('*')
      .eq('id', rep_id)
      .single();

    if (repErr) return res.status(404).json({ error: 'Rep not found' });

    // 2. Build the SMS message
    const message = buildCardMessage(rep, customer_name);

    // 3. Send via Twilio
    const toNumber = normalizePhone(customer_phone);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   toNumber,
    });

    // 4. Save contact to Supabase
    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .insert({ rep_id, customer_name, customer_phone: toNumber })
      .select()
      .single();

    if (contactErr) throw contactErr;

    res.status(201).json({
      success: true,
      contact,
      message_preview: message,
    });
  } catch (err) {
    // Twilio errors have a .message with useful detail
    next(err);
  }
});

// ── Helpers ───────────────────────────────────────────────────

function buildCardMessage(rep, customerName) {
  const greeting = customerName ? `Hi ${customerName}! ` : 'Hi! ';
  const lines = [
    `${greeting}Great meeting you. Here's my digital card:`,
    '',
    rep.name,
  ];
  if (rep.title)          lines.push(rep.title);
  if (rep.store_location) lines.push(`📍 ${rep.store_location}`);
  if (rep.phone)          lines.push(`📞 ${rep.phone}`);
  if (rep.email)          lines.push(`✉️  ${rep.email}`);
  lines.push('', 'Looking forward to helping you find the perfect piece!');
  return lines.join('\n');
}

function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

module.exports = router;
