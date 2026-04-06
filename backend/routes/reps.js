const express  = require('express');
const router   = express.Router();
const supabase = require('../lib/supabase');
const upload   = require('../lib/upload');

// ── GET /api/reps/:id  — fetch a rep's profile ───────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reps')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Rep not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// ── POST /api/reps  — create a new rep profile ───────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, title, store_location, phone, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const { data, error } = await supabase
      .from('reps')
      .insert({ name, title, store_location, phone, email })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// ── PATCH /api/reps/:id  — update profile fields ─────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'title', 'store_location', 'phone', 'email'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const { data, error } = await supabase
      .from('reps')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// ── POST /api/reps/:id/photo  — upload profile photo ─────────
//    Multipart form-data, field name: "photo"
router.post('/:id/photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const photo_url = req.file.path;   // Cloudinary secure URL

    const { data, error } = await supabase
      .from('reps')
      .update({ photo_url })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ photo_url: data.photo_url });
  } catch (err) { next(err); }
});

module.exports = router;
