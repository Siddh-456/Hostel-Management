const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');

// Get PII deletion logs
router.get('/logs', authMiddleware, requireRole('superadmin'), async (req, res) => {
  try {
    const logs = await db.all('SELECT * FROM pii_deletion_log ORDER BY requested_at DESC LIMIT 50', []);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Request PII deletion (student can request their own)
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { student_id } = req.body;
    
    // Students can only request deletion for themselves
    if (req.user.role === 'student' && student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Cannot request deletion for other users' });
    }

    // Check if request already exists and pending
    const existing = await db.get(
      'SELECT * FROM pii_deletion_log WHERE student_id = ? AND status = ?',
      [student_id, 'pending']
    );

    if (existing) {
      return res.status(409).json({ success: false, message: 'Deletion request already pending' });
    }

    const result = await db.run(
      `INSERT INTO pii_deletion_log (student_id, status, requested_by, requested_at)
       VALUES (?, ?, ?, ?)`,
      [student_id, 'pending', req.user.id, new Date().toISOString()]
    );

    res.status(201).json({ success: true, data: { id: result.id, message: 'PII deletion request submitted' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve/execute PII deletion (admin only)
router.post('/:id/execute', authMiddleware, requireRole('superadmin'), async (req, res) => {
  try {
    const record = await db.get('SELECT * FROM pii_deletion_log WHERE id = ?', [req.params.id]);
    
    if (!record) {
      return res.status(404).json({ success: false, message: 'Deletion request not found' });
    }

    if (record.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be executed' });
    }

    // Delete student's personal data (soft delete approach)
    await db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      ['[DELETED]', `deleted_${record.student_id}@deleted.local`, record.student_id]
    );

    // Clear sensitive fields from students table
    await db.run(
      'UPDATE students SET phone = ?, date_of_birth = ? WHERE user_id = ?',
      [null, null, record.student_id]
    );

    // Update deletion log
    await db.run(
      'UPDATE pii_deletion_log SET status = ?, executed_by = ?, executed_at = ? WHERE id = ?',
      ['completed', req.user.id, new Date().toISOString(), req.params.id]
    );

    res.json({ success: true, message: 'PII deletion executed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
