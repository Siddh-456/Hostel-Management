const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get complaints
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];

    if (req.query.student_id) {
      query += ' AND student_id = ?';
      params.push(req.query.student_id);
    }

    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }

    if (req.query.category) {
      query += ' AND category = ?';
      params.push(req.query.category);
    }

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
    const result = await db.run(
      `INSERT INTO complaints (student_id, category, description, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [req.body.student_id || req.user.id, req.body.category, req.body.description, 'open', new Date().toISOString()]
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
    const { status, resolution } = req.body;
    
    if (!status || !['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required' });
    }

    await db.run(
      'UPDATE complaints SET status = ?, resolution = ?, resolved_by = ?, resolved_at = ? WHERE id = ?',
      [status, resolution || null, req.user.id, status === 'resolved' ? new Date().toISOString() : null, req.params.id]
    );

    const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
