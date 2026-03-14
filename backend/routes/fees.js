const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get fees
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM fees WHERE 1=1';
    const params = [];

    if (req.query.student_id) {
      query += ' AND student_id = ?';
      params.push(req.query.student_id);
    }

    if (req.query.year) {
      query += ' AND academic_year = ?';
      params.push(req.query.year);
    }

    const fees = await db.all(query, params);
    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create fee
router.post('/', authMiddleware, requireRole('superadmin', 'warden', 'accountant'), async (req, res) => {
  try {
    const result = await db.run(
      `INSERT INTO fees (student_id, amount, description, academic_year, due_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.body.student_id, req.body.amount, req.body.description || null, req.body.academic_year, req.body.due_date || null, req.user.id]
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
    await db.run(
      'UPDATE fees SET status = ?, paid_date = ?, marked_by = ? WHERE id = ?',
      ['paid', new Date().toISOString(), req.user.id, req.params.id]
    );

    const fee = await db.get('SELECT * FROM fees WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: fee, message: 'Fee marked as paid' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
