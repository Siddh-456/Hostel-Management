const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get payments
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];

    if (req.query.student_id) {
      query += ' AND student_id = ?';
      params.push(req.query.student_id);
    }

    if (req.query.status) {
      query += ' AND payment_status = ?';
      params.push(req.query.status);
    }

    const payments = await db.all(query, params);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validate amount
    if (!req.body.amount || req.body.amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }

    const result = await db.run(
      `INSERT INTO payments (student_id, amount, payment_method, transaction_id, payment_status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.body.student_id || req.user.id, req.body.amount, req.body.payment_method || 'cash', req.body.transaction_id || null, 'completed', req.user.id]
    );

    const payment = await db.get('SELECT * FROM payments WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
