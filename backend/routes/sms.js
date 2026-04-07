const express = require('express');
const router  = express.Router();
const supabase = require('../lib/supabase');

router.post('/send', async (req, res, next) => {
  try {
    const { rep_id, customer_name, customer_phone } = req.body;

    if (!rep_id)         return res.status(400).json({ error: 'rep_id is required' });
    if (!customer_name)  return res.status(400).json({ error: 'customer_name is required' });
    if (!customer_phone) return res.status(400).json({ error: 'customer_phone is required' });

    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({ rep_id, customer_name, customer_phone })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, contact });
  } catch (err) { next(err); }
});

module.exports = router;