const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

async function buildFullProfile(userId) {
  const [[user]] = await pool.query(
    'SELECT id, first_name, last_name, username FROM Users WHERE id = ?',
    [userId]
  );
  if (!user) return null;

  const [education] = await pool.query(
    `SELECT e.id, e.start_date, e.end_date, e.degree, s.id AS school_id, s.name AS school_name, s.type, s.location, s.year
     FROM Education e JOIN Schools s ON s.id = e.school_id
     WHERE e.user_id = ? ORDER BY e.start_date DESC`,
    [userId]
  );

  const [employment] = await pool.query(
    `SELECT emp.id, emp.start_date, emp.end_date, emp.title, c.id AS company_id, c.name AS company_name, c.industry, c.location
     FROM Employment emp JOIN Companies c ON c.id = emp.company_id
     WHERE emp.user_id = ? ORDER BY emp.start_date DESC`,
    [userId]
  );

  const [skills] = await pool.query(
    `SELECT sk.id, sk.name FROM UserSkills us JOIN Skills sk ON sk.id = us.skill_id WHERE us.user_id = ?`,
    [userId]
  );

  const [[{ count: postCount }]] = await pool.query(
    'SELECT COUNT(*) as count FROM Posts WHERE user_id = ?',
    [userId]
  );

  const [[{ count: connectionCount }]] = await pool.query(
    `SELECT COUNT(*) as count FROM UserConnections
     WHERE status = 'accepted' AND (user_id = ? OR connection_id = ?)`,
    [userId, userId]
  );

  return { ...user, education, employment, skills, postCount, connectionCount };
}

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  const profile = await buildFullProfile(req.userId);
  res.json(profile);
});

// GET /api/users/search?q=...
router.get('/search', requireAuth, async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const [rows] = await pool.query(
    `SELECT id, first_name, last_name, username FROM Users
     WHERE (first_name LIKE ? OR last_name LIKE ? OR username LIKE ?) AND id != ? LIMIT 20`,
    [q, q, q, req.userId]
  );
  res.json(rows);
});

// GET /api/users/:id
router.get('/:id', requireAuth, async (req, res) => {
  const profile = await buildFullProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: 'User not found' });
  res.json(profile);
});

// PUT /api/users/me - update name
router.put('/me', requireAuth, async (req, res) => {
  const { first_name, last_name } = req.body;
  await pool.query(
    'UPDATE Users SET first_name = COALESCE(?, first_name), last_name = ? WHERE id = ?',
    [first_name, last_name ?? null, req.userId]
  );
  const profile = await buildFullProfile(req.userId);
  res.json(profile);
});

module.exports = router;
