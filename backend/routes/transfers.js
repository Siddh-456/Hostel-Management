const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get transfer requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM transfer_requests WHERE 1=1';
    const params = [];

    if (req.query.student_id) {
      query += ' AND student_id = ?';
      params.push(req.query.student_id);
    }

    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }

    const transfers = await db.all(query, params);
    res.json({ success: true, data: transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create transfer request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.run(
      `INSERT INTO transfer_requests (student_id, from_room_id, to_room_id, reason, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.body.student_id || req.user.id, req.body.from_room_id, req.body.to_room_id, req.body.reason || null, 'pending', new Date().toISOString()]
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

    // Update transfer status
    await db.run(
      'UPDATE transfer_requests SET status = ?, approved_by = ?, approved_at = ? WHERE id = ?',
      ['approved', req.user.id, new Date().toISOString(), req.params.id]
    );

    // Update room allocation
    await db.run(
      'UPDATE room_allocations SET room_id = ?, check_out_date = ? WHERE student_id = ? AND check_out_date IS NULL',
      [transfer.to_room_id, new Date().toISOString(), transfer.student_id]
    );

    // Create new allocation
    await db.run(
      `INSERT INTO room_allocations (student_id, room_id, check_in_date, active, allocated_by, allocated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transfer.student_id, transfer.to_room_id, new Date().toISOString(), 1, req.user.id, new Date().toISOString()]
    );

    res.json({ success: true, message: 'Transfer approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject transfer request
router.post('/:id/reject', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    await db.run(
      'UPDATE transfer_requests SET status = ?, rejected_by = ?, rejected_at = ? WHERE id = ?',
      ['rejected', req.user.id, new Date().toISOString(), req.params.id]
    );

    res.json({ success: true, message: 'Transfer rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
