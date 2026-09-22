const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/education - add an education entry for yourself
router.post('/', requireAuth, async (req, res) => {
  const { school_id, start_date, end_date, degree } = req.body;
  if (!school_id) return res.status(400).json({ error: 'school_id is required' });
  const [result] = await pool.query(
    'INSERT INTO Education (user_id, school_id, start_date, end_date, degree) VALUES (?, ?, ?, ?, ?)',
    [req.userId, school_id, start_date || null, end_date || null, degree || null]
  );
  res.status(201).json({ id: result.insertId });
});

// DELETE /api/education/:id - remove your own education entry
router.delete('/:id', requireAuth, async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM Education WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or not yours' });
  res.json({ success: true });
});

module.exports = router;
