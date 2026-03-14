const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get inventory
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (req.query.room_id) {
      query += ' AND room_id = ?';
      params.push(req.query.room_id);
    }

    if (req.query.category) {
      query += ' AND category = ?';
      params.push(req.query.category);
    }

    const inventory = await db.all(query, params);
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create inventory item
router.post('/', authMiddleware, requireRole('superadmin', 'warden', 'caretaker'), async (req, res) => {
  try {
    const result = await db.run(
      `INSERT INTO inventory (room_id, item_name, category, quantity, condition, added_by, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.body.room_id || null, req.body.item_name, req.body.category, req.body.quantity || 1, req.body.condition || 'good', req.user.id, new Date().toISOString()]
    );

    const item = await db.get('SELECT * FROM inventory WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update inventory item
router.put('/:id', authMiddleware, requireRole('superadmin', 'warden', 'caretaker'), async (req, res) => {
  try {
    const updates = [];
    const values = [];

    if (req.body.quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(req.body.quantity);
    }
    if (req.body.condition) {
      updates.push('condition = ?');
      values.push(req.body.condition);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await db.run(`UPDATE inventory SET ${updates.join(', ')} WHERE id = ?`, values);

    const item = await db.get('SELECT * FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
