const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get waitlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM waitlist WHERE status = ? ORDER BY created_at ASC';
    const params = ['active'];

    if (req.query.room_id) {
      query = 'SELECT * FROM waitlist WHERE room_id = ? AND status = ? ORDER BY created_at ASC';
      params.unshift(req.query.room_id);
    }

    const waitlist = await db.all(query, params);
    res.json({ success: true, data: waitlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to waitlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if already in waitlist
    const existing = await db.get(
      'SELECT * FROM waitlist WHERE student_id = ? AND room_id = ? AND status = ?',
      [req.body.student_id || req.user.id, req.body.room_id, 'active']
    );

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in waitlist for this room' });
    }

    const result = await db.run(
      `INSERT INTO waitlist (student_id, room_id, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [req.body.student_id || req.user.id, req.body.room_id, req.body.priority || 'normal', 'active', new Date().toISOString()]
    );

    const waitlistEntry = await db.get('SELECT * FROM waitlist WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: waitlistEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from waitlist
router.post('/:id/remove', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    await db.run('UPDATE waitlist SET status = ? WHERE id = ?', ['removed', req.params.id]);
    res.json({ success: true, message: 'Removed from waitlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
