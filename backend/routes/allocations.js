const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/database');

// Get allocations
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM room_allocations WHERE 1=1';
    const params = [];

    if (req.query.student_id) {
      query += ' AND student_id = ?';
      params.push(req.query.student_id);
    }

    const allocations = await db.all(query, params);
    res.json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create allocation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.run(
      'INSERT INTO room_allocations (student_id, room_id, check_in_date, active, allocated_by) VALUES (?, ?, ?, ?, ?)',
      [req.body.student_id, req.body.room_id, req.body.check_in_date, 1, req.user.id]
    );

    const allocation = await db.get('SELECT * FROM room_allocations WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update allocation
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = [];
    const values = [];
    
    if (req.body.check_out_date !== undefined) { updates.push('check_out_date = ?'); values.push(req.body.check_out_date); }
    if (req.body.active !== undefined) { updates.push('active = ?'); values.push(req.body.active ? 1 : 0); }

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
