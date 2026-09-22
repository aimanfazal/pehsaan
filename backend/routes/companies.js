const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/companies?q=... - search existing companies (for autocomplete)
router.get('/', requireAuth, async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await pool.query(
    'SELECT id, name, industry, location FROM Companies WHERE name LIKE ? LIMIT 20',
    [q]
  );
  res.json(rows);
});

// POST /api/companies - create a new company
router.post('/', requireAuth, async (req, res) => {
  const { name, industry, location } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const [result] = await pool.query(
    'INSERT INTO Companies (name, industry, location) VALUES (?, ?, ?)',
    [name, industry || null, location || null]
  );
  res.status(201).json({ id: result.insertId, name, industry, location });
});

module.exports = router;
