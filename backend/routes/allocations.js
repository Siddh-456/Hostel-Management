const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const { requireStudentRecord, resolveStudentRecord } = require('../utils/student');

// Get allocations
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM room_allocations WHERE 1=1';
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

    query += ' ORDER BY active DESC, allocated_at DESC';
    const allocations = await db.all(query, params);
    res.json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create allocation
router.post('/', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    const student = await requireStudentRecord(req.body.student_id);
    const room = await db.get('SELECT * FROM rooms WHERE id = ? AND room_type = ?', [req.body.room_id, 'student']);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Student room not found' });
    }

    await db.run(
      'UPDATE room_allocations SET active = FALSE, check_out_date = ? WHERE student_id = ? AND active = TRUE',
      [req.body.check_in_date, student.id]
    );

    const result = await db.run(
      'INSERT INTO room_allocations (student_id, room_id, check_in_date, active, allocated_by) VALUES (?, ?, ?, ?, ?)',
      [student.id, req.body.room_id, req.body.check_in_date, true, req.user.id]
    );

    const allocation = await db.get('SELECT * FROM room_allocations WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update allocation
router.put('/:id', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    
    if (req.body.check_out_date !== undefined) { updates.push('check_out_date = ?'); values.push(req.body.check_out_date); }
    if (req.body.active !== undefined) { updates.push('active = ?'); values.push(Boolean(req.body.active)); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    values.push(req.params.id);
    await db.run(`UPDATE room_allocations SET ${updates.join(', ')} WHERE id = ?`, values);

    const allocation = await db.get('SELECT * FROM room_allocations WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
