const express  = require('express');
const router   = express.Router();
const supabase = require('../lib/supabase');

// ── GET /api/contacts?rep_id=xxx  — list contacts for a rep ──
router.get('/', async (req, res, next) => {
  try {
    const { rep_id } = req.query;
    if (!rep_id) return res.status(400).json({ error: 'rep_id is required' });

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('rep_id', rep_id)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// ── POST /api/contacts  — save a new contact ─────────────────
//    Called automatically when a card is sent
router.post('/', async (req, res, next) => {
  try {
    const { rep_id, customer_name, customer_phone } = req.body;

    if (!rep_id)          return res.status(400).json({ error: 'rep_id is required' });
    if (!customer_name)   return res.status(400).json({ error: 'customer_name is required' });
    if (!customer_phone)  return res.status(400).json({ error: 'customer_phone is required' });

    const { data, error } = await supabase
      .from('contacts')
      .insert({ rep_id, customer_name, customer_phone })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// ── DELETE /api/contacts/:id  — remove a contact ─────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
