const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const { requireStudentRecord, resolveStudentRecord } = require('../utils/student');

// Get transfer requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM transfer_requests WHERE 1=1';
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

    query += ' ORDER BY requested_at DESC';
    const transfers = await db.all(query, params);
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create transfer request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const student = await requireStudentRecord(
      req.body.student_id,
      req.user.role === 'student' ? req.user.id : null
    );
    const currentAllocation = await db.get(
      'SELECT * FROM room_allocations WHERE student_id = ? AND active = TRUE ORDER BY allocated_at DESC LIMIT 1',
      [student.id]
    );
    const destinationRoom = await db.get(
      'SELECT * FROM rooms WHERE id = ? AND room_type = ? AND active = TRUE',
      [req.body.to_room_id, 'student']
    );

    if (!destinationRoom) {
      return res.status(404).json({ success: false, message: 'Destination room not found' });
    }

    const result = await db.run(
      `INSERT INTO transfer_requests (student_id, from_room_id, to_room_id, reason, status, requested_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        student.id,
        req.body.from_room_id || currentAllocation?.room_id || null,
        req.body.to_room_id,
        req.body.reason || null,
        'pending',
        new Date().toISOString()
      ]
    );

    const transfer = await db.get('SELECT * FROM transfer_requests WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve transfer request
router.post('/:id/approve', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    const transfer = await db.get('SELECT * FROM transfer_requests WHERE id = ?', [req.params.id]);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending transfers can be approved' });
    }

    const destinationRoom = await db.get(
      'SELECT * FROM rooms WHERE id = ? AND room_type = ? AND active = TRUE',
      [transfer.to_room_id, 'student']
    );
    if (!destinationRoom) {
      return res.status(404).json({ success: false, message: 'Destination room not found' });
    }

    await db.run(
      'UPDATE transfer_requests SET status = ?, processed_by = ?, processed_at = ? WHERE id = ?',
      ['approved', req.user.id, new Date().toISOString(), req.params.id]
    );

    await db.run(
      'UPDATE room_allocations SET active = FALSE, check_out_date = ? WHERE student_id = ? AND active = TRUE',
      [new Date().toISOString(), transfer.student_id]
    );

    await db.run(
      `INSERT INTO room_allocations (student_id, room_id, check_in_date, active, allocated_by, allocated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transfer.student_id, transfer.to_room_id, new Date().toISOString(), true, req.user.id, new Date().toISOString()]
    );

    res.json({ success: true, message: 'Transfer approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject transfer request
router.post('/:id/reject', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    const transfer = await db.get('SELECT * FROM transfer_requests WHERE id = ?', [req.params.id]);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    await db.run(
      'UPDATE transfer_requests SET status = ?, processed_by = ?, processed_at = ? WHERE id = ?',
      ['rejected', req.user.id, new Date().toISOString(), req.params.id]
    );

    res.json({ success: true, message: 'Transfer rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
