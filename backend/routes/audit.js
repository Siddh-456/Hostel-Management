const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get audit logs
router.get('/', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    let query = 'SELECT * FROM audit_log WHERE 1=1';
    const params = [];

    if (req.query.action) {
      query += ' AND action = ?';
      params.push(req.query.action);
    }

    if (req.query.user_id) {
      query += ' AND user_id = ?';
      params.push(req.query.user_id);
    }

    if (req.query.resource_type) {
      query += ' AND resource_type = ?';
      params.push(req.query.resource_type);
    }

    query += ' ORDER BY timestamp DESC LIMIT 100';
    const logs = await db.all(query, params);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get audit log by ID
router.get('/:id', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    const log = await db.get('SELECT * FROM audit_log WHERE id = ?', [req.params.id]);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
