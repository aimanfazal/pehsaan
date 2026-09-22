const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/skills?q=... - search the master skills list (for autocomplete)
router.get('/', requireAuth, async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await pool.query('SELECT id, name FROM Skills WHERE name LIKE ? LIMIT 20', [q]);
  res.json(rows);
});

// POST /api/skills - add a skill to your own profile (creates the skill if new)
router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const cleanName = name.trim();

  let skillId;
  const [existing] = await pool.query('SELECT id FROM Skills WHERE name = ?', [cleanName]);
  if (existing.length > 0) {
    skillId = existing[0].id;
  } else {
    const [result] = await pool.query('INSERT INTO Skills (name) VALUES (?)', [cleanName]);
    skillId = result.insertId;
  }

  try {
    await pool.query('INSERT INTO UserSkills (user_id, skill_id) VALUES (?, ?)', [req.userId, skillId]);
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') throw err; // already has this skill, fine
  }

  res.status(201).json({ id: skillId, name: cleanName });
});

// DELETE /api/skills/:skillId - remove a skill from your own profile
router.delete('/:skillId', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM UserSkills WHERE user_id = ? AND skill_id = ?', [req.userId, req.params.skillId]);
  res.json({ success: true });
});

module.exports = router;
