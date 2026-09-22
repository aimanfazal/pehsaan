const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/schools?q=... - search existing schools (for autocomplete)
router.get('/', requireAuth, async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await pool.query(
    'SELECT id, name, type, location, year FROM Schools WHERE name LIKE ? LIMIT 20',
    [q]
  );
  res.json(rows);
});

// POST /api/schools - create a new school
router.post('/', requireAuth, async (req, res) => {
  const { name, type, location, year } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const [result] = await pool.query(
    'INSERT INTO Schools (name, type, location, year) VALUES (?, ?, ?, ?)',
    [name, type || null, location || null, year || null]
  );
  res.status(201).json({ id: result.insertId, name, type, location, year });
});

module.exports = router;
