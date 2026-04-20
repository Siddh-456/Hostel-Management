const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const { requireStudentRecord, resolveStudentRecord } = require('../utils/student');

// Get complaints
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM complaints WHERE 1=1';
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

    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }

    if (req.query.category) {
      query += ' AND category = ?';
      params.push(req.query.category);
    }

    query += ' ORDER BY created_at DESC';
    const complaints = await db.all(query, params);
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get complaint by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create complaint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const student = await requireStudentRecord(
      req.body.student_id,
      req.user.role === 'student' ? req.user.id : null
    );
    const currentAllocation = await db.get(
      'SELECT room_id FROM room_allocations WHERE student_id = ? AND active = TRUE ORDER BY allocated_at DESC LIMIT 1',
      [student.id]
    );

    const result = await db.run(
      `INSERT INTO complaints (student_id, room_id, category, description, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        student.id,
        req.body.room_id || currentAllocation?.room_id || null,
        req.body.category,
        req.body.description,
        'open'
      ]
    );

    const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update complaint status
router.post('/:id/update-status', authMiddleware, requireRole('superadmin', 'warden', 'caretaker'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required' });
    }

    const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await db.run(
      'UPDATE complaints SET status = ?, assigned_to = ?, resolved_at = ? WHERE id = ?',
      [
        status,
        req.user.id,
        ['resolved', 'closed'].includes(status) ? new Date().toISOString() : null,
        req.params.id
      ]
    );

    const updatedComplaint = await db.get('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
