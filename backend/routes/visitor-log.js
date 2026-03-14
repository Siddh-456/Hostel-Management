const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/database');

// Create visitor log
router.post('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.run(
      `INSERT INTO visitor_log (host_student_id, visitor_name, visitor_phone, purpose, check_in, check_out, logged_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.body.host_student_id, req.body.visitor_name, req.body.visitor_phone || null, req.body.purpose || null, req.body.check_in, req.body.check_out || null, req.user.id]
    );

    const log = await db.get('SELECT * FROM visitor_log WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get visitor logs
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM visitor_log WHERE 1=1';
    const params = [];

    if (req.query.host_student_id) {
      query += ' AND host_student_id = ?';
      params.push(req.query.host_student_id);
    }

    const logs = await db.all(query, params);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
