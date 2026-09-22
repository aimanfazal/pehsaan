const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/connections/request/:userId - send a connection request
router.post('/request/:userId', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.userId, 10);
  if (targetId === req.userId) {
    return res.status(400).json({ error: "You can't connect with yourself" });
  }
  try {
    await pool.query(
      'INSERT INTO UserConnections (user_id, connection_id, status, created_at) VALUES (?, ?, ?, NOW())',
      [req.userId, targetId, 'pending']
    );
    res.status(201).json({ success: true, status: 'pending' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A connection request already exists between you two' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/connections/accept/:userId - accept a request FROM userId
router.post('/accept/:userId', requireAuth, async (req, res) => {
  const [result] = await pool.query(
    `UPDATE UserConnections SET status = 'accepted'
     WHERE user_id = ? AND connection_id = ? AND status = 'pending'`,
    [req.params.userId, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found' });
  res.json({ success: true });
});

// POST /api/connections/reject/:userId - reject a request FROM userId
router.post('/reject/:userId', requireAuth, async (req, res) => {
  const [result] = await pool.query(
    `UPDATE UserConnections SET status = 'rejected'
     WHERE user_id = ? AND connection_id = ? AND status = 'pending'`,
    [req.params.userId, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found' });
  res.json({ success: true });
});

// GET /api/connections - your accepted connections
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.username
     FROM UserConnections uc
     JOIN Users u ON u.id = CASE WHEN uc.user_id = ? THEN uc.connection_id ELSE uc.user_id END
     WHERE uc.status = 'accepted' AND (uc.user_id = ? OR uc.connection_id = ?)`,
    [req.userId, req.userId, req.userId]
  );
  res.json(rows);
});

// GET /api/connections/pending - incoming pending requests
router.get('/pending', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.username
     FROM UserConnections uc
     JOIN Users u ON u.id = uc.user_id
     WHERE uc.connection_id = ? AND uc.status = 'pending'`,
    [req.userId]
  );
  res.json(rows);
});

// GET /api/connections/status/:userId - relationship status with a given user
router.get('/status/:userId', requireAuth, async (req, res) => {
  const otherId = req.params.userId;
  const [rows] = await pool.query(
    `SELECT user_id, connection_id, status FROM UserConnections
     WHERE (user_id = ? AND connection_id = ?) OR (user_id = ? AND connection_id = ?)`,
    [req.userId, otherId, otherId, req.userId]
  );
  if (rows.length === 0) return res.json({ status: 'none' });
  const row = rows[0];
  res.json({ status: row.status, requested_by_me: String(row.user_id) === String(req.userId) });
});

module.exports = router;
