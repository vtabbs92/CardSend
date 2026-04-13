const express  = require('express');
const router   = express.Router();
const supabase = require('../lib/supabase');
const upload   = require('../lib/upload');

// GET /api/reps/all — must be before /:id
router.get('/all', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reps').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) { next(err); }
});

// GET /api/reps/by-user/:userId
router.get('/by-user/:userId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reps').select('*').eq('user_id', req.params.userId).single();
    if (error) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/reps/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reps').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Rep not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/reps
router.post('/', async (req, res, next) => {
  try {
    const { name, title, store_location, phone, email, user_id } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const { data, error } = await supabase
      .from('reps').insert({ name, title, store_location, phone, email, user_id })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// PATCH /api/reps/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'title', 'store_location', 'phone', 'email'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const { data, error } = await supabase
      .from('reps').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/reps/:id/photo
router.post('/:id/photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const photo_url = req.file.path;
    const { data, error } = await supabase
      .from('reps').update({ photo_url }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ photo_url: data.photo_url });
  } catch (err) { next(err); }
});

module.exports = router;
