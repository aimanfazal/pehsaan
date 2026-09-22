const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - feed: your posts + accepted connections' posts
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.content, p.created_at, u.id AS user_id, u.first_name, u.last_name
     FROM Posts p
     JOIN Users u ON u.id = p.user_id
     WHERE p.user_id = ?
        OR p.user_id IN (
          SELECT CASE WHEN user_id = ? THEN connection_id ELSE user_id END
          FROM UserConnections
          WHERE status = 'accepted' AND (user_id = ? OR connection_id = ?)
        )
     ORDER BY p.created_at DESC
     LIMIT 50`,
    [req.userId, req.userId, req.userId, req.userId]
  );
  res.json(rows);
});

// GET /api/posts/user/:id - posts by a specific user
router.get('/user/:id', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.content, p.created_at, u.id AS user_id, u.first_name, u.last_name
     FROM Posts p JOIN Users u ON u.id = p.user_id
     WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
});

// POST /api/posts - create a post
router.post('/', requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content is required' });
  }
  const [result] = await pool.query(
    'INSERT INTO Posts (user_id, content, created_at) VALUES (?, ?, NOW())',
    [req.userId, content.trim()]
  );
  res.status(201).json({ id: result.insertId, content, user_id: req.userId });
});

// DELETE /api/posts/:id - delete your own post
router.delete('/:id', requireAuth, async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM Posts WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Post not found or not yours' });
  res.json({ success: true });
});

module.exports = router;
