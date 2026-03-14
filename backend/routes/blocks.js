const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Get all blocks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const blocks = await db.all('SELECT * FROM hostel_blocks');
    res.json({ success: true, data: blocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create block
router.post('/', authMiddleware, requireRole('warden', 'superadmin'), [
  body('name').notEmpty(),
  body('location').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const result = await db.run(
      'INSERT INTO hostel_blocks (name, location, remarks) VALUES (?, ?, ?)',
      [req.body.name, req.body.location, req.body.remarks || '']
    );

    const block = await db.get('SELECT * FROM hostel_blocks WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update block
router.put('/:id', authMiddleware, requireRole('warden', 'superadmin'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    
    if (req.body.name !== undefined) { updates.push('name = ?'); values.push(req.body.name); }
    if (req.body.location !== undefined) { updates.push('location = ?'); values.push(req.body.location); }
    if (req.body.remarks !== undefined) { updates.push('remarks = ?'); values.push(req.body.remarks); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    values.push(req.params.id);
    await db.run(`UPDATE hostel_blocks SET ${updates.join(', ')} WHERE id = ?`, values);

    const block = await db.get('SELECT * FROM hostel_blocks WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
