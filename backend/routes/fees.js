const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const { requireStudentRecord, resolveStudentRecord } = require('../utils/student');

// Get fees
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM fees WHERE 1=1';
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

    if (req.query.year) {
      query += ' AND EXTRACT(YEAR FROM due_date) = ?';
      params.push(Number(req.query.year));
    }

    query += ' ORDER BY paid ASC, due_date ASC, created_at DESC';
    const fees = await db.all(query, params);
    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create fee
router.post('/', authMiddleware, requireRole('superadmin', 'warden', 'accountant'), async (req, res) => {
  try {
    const student = await requireStudentRecord(req.body.student_id);
    const result = await db.run(
      `INSERT INTO fees (student_id, fee_type, amount, due_date)
       VALUES (?, ?, ?, ?)`,
      [
        student.id,
        req.body.fee_type || 'hostel_fee',
        req.body.amount,
        req.body.due_date || null
      ]
    );

    const fee = await db.get('SELECT * FROM fees WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark fee as paid
router.post('/:id/mark-paid', authMiddleware, requireRole('superadmin', 'warden', 'accountant'), async (req, res) => {
  try {
    const existingFee = await db.get('SELECT * FROM fees WHERE id = ?', [req.params.id]);
    if (!existingFee) {
      return res.status(404).json({ success: false, message: 'Fee not found' });
    }

    await db.run(
      'UPDATE fees SET paid = TRUE WHERE id = ?',
      [req.params.id]
    );

    const fee = await db.get('SELECT * FROM fees WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: fee, message: 'Fee marked as paid' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
