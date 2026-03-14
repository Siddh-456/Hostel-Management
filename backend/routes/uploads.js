const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// Get file info and validate access
router.get('/:filename', authMiddleware, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Security: Prevent directory traversal
    if (!path.normalize(filePath).startsWith(path.normalize(path.join(__dirname, '../uploads')))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Only staff can download files, or students can download their own
    if (req.user.role === 'student') {
      // Students can only access their own guest request attachments
      if (!filename.includes(`_${req.user.id}_`)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (!['superadmin', 'warden', 'accountant', 'caretaker'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Staff access required' });
    }

    // Send file
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete file (staff only)
router.delete('/:filename', authMiddleware, requireRole('superadmin', 'warden', 'caretaker'), async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Security: Prevent directory traversal
    if (!path.normalize(filePath).startsWith(path.normalize(path.join(__dirname, '../uploads')))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Delete file
    await fs.unlink(filePath);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
