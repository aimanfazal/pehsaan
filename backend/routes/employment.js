const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/employment - add a job entry for yourself
router.post('/', requireAuth, async (req, res) => {
  const { company_id, start_date, end_date, title } = req.body;
  if (!company_id) return res.status(400).json({ error: 'company_id is required' });
  const [result] = await pool.query(
    'INSERT INTO Employment (user_id, company_id, start_date, end_date, title) VALUES (?, ?, ?, ?, ?)',
    [req.userId, company_id, start_date || null, end_date || null, title || null]
  );
  res.status(201).json({ id: result.insertId });
});

// DELETE /api/employment/:id - remove your own job entry
router.delete('/:id', requireAuth, async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM Employment WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or not yours' });
  res.json({ success: true });
});

module.exports = router;
