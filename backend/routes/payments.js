const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/database');
const { requireStudentRecord, resolveStudentRecord } = require('../utils/student');

// Get payments
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];

    if (req.user.role === 'student') {
      const student = await requireStudentRecord(null, req.user.id);
      query += ' AND student_id = ?';
      params.push(student.id);
    } else if (req.query.student_id) {
      const student = await resolveStudentRecord(req.query.student_id);
      if (!student) {
        return res.json({ success: true, data: [] });
      }
      query += ' AND student_id = ?';
      params.push(student.id);
    }

    if (req.query.payment_for) {
      query += ' AND payment_for = ?';
      params.push(req.query.payment_for);
    }

    query += ' ORDER BY recorded_at DESC';
    const payments = await db.all(query, params);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }

    const student = await requireStudentRecord(
      req.body.student_id,
      req.user.role === 'student' ? req.user.id : null
    );
    const paymentFor = req.body.payment_for || 'hostel_fee';
    const method = req.body.method || req.body.payment_method || 'cash';
    const txnRef = req.body.txn_ref || req.body.transaction_id || null;

    const result = await db.run(
      `INSERT INTO payments (student_id, payment_for, amount, method, txn_ref, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student.id, paymentFor, amount, method, txnRef, req.user.id]
    );

    if (req.body.fee_id) {
      await db.run('UPDATE fees SET paid = TRUE WHERE id = ?', [req.body.fee_id]);
    }

    const payment = await db.get('SELECT * FROM payments WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
