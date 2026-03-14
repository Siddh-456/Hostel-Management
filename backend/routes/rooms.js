const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Get all rooms
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rooms = await db.all('SELECT * FROM rooms');
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get room by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await db.get('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create room
router.post('/', authMiddleware, requireRole('warden', 'superadmin'), [
  body('name').notEmpty(),
  body('room_type').isIn(['student', 'guest']),
  body('capacity').isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const result = await db.run(
      'INSERT INTO rooms (block_id, name, room_type, capacity, description, active) VALUES (?, ?, ?, ?, ?, ?)',
      [req.body.block_id || null, req.body.name, req.body.room_type, req.body.capacity, req.body.description || '', 1]
    );

    const room = await db.get('SELECT * FROM rooms WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update room
router.put('/:id', authMiddleware, requireRole('warden', 'superadmin'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    
    if (req.body.name !== undefined) { updates.push('name = ?'); values.push(req.body.name); }
    if (req.body.capacity !== undefined) { updates.push('capacity = ?'); values.push(req.body.capacity); }
    if (req.body.active !== undefined) { updates.push('active = ?'); values.push(req.body.active ? 1 : 0); }
    if (req.body.description !== undefined) { updates.push('description = ?'); values.push(req.body.description); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    values.push(req.params.id);
    await db.run(`UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`, values);

    const room = await db.get('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete room
router.delete('/:id', authMiddleware, requireRole('warden', 'superadmin'), async (req, res) => {
  try {
    await db.run('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
