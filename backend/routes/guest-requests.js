const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const config = require('../config/env');
const { body, validationResult } = require('express-validator');

// Setup multer for file uploads
const uploadDir = config.FILE_UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: config.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get guest requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM guest_visit_requests WHERE 1=1';
    const params = [];

    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }

    if (req.query.host_student_id) {
      query += ' AND host_student_id = ?';
      params.push(req.query.host_student_id);
    }

    const requests = await db.all(query, params);
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get guest request by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create guest request
router.post('/', authMiddleware, upload.single('id_proof'), async (req, res) => {
  try {
    const checkIn = new Date(req.body.check_in);
    const checkOut = new Date(req.body.check_out);

    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights > config.MAX_OVERNIGHT_NIGHTS) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: `Max overnight nights is ${config.MAX_OVERNIGHT_NIGHTS}` });
    }

    const isOvernight = nights >= 1;
    if (isOvernight && !req.file) {
      return res.status(400).json({ success: false, message: 'ID proof required for overnight stays' });
    }

    const result = await db.run(
      `INSERT INTO guest_visit_requests 
      (host_student_id, guest_name, guest_phone, guest_email, id_proof_path, guest_relation, check_in, check_out, nights_calculated, status, requested_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.host_student_id,
        req.body.guest_name,
        req.body.guest_phone || null,
        req.body.guest_email || null,
        req.file ? req.file.filename : null,
        req.body.guest_relation || null,
        req.body.check_in,
        req.body.check_out,
        nights,
        'pending',
        req.user.id
      ]
    );

    const request = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve guest request
router.post('/:id/approve', authMiddleware, requireRole('warden', 'caretaker', 'superadmin'), async (req, res) => {
  try {
    const request = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (!req.body.assigned_guest_room_id) {
      return res.status(400).json({ success: false, message: 'Guest room must be assigned' });
    }

    const room = await db.get('SELECT * FROM rooms WHERE id = ? AND room_type = "guest"', [req.body.assigned_guest_room_id]);
    if (!room) return res.status(404).json({ success: false, message: 'Guest room not found' });

    // Check capacity
    const checkIn = new Date(request.check_in);
    const checkOut = new Date(request.check_out);

    const overlapping = await db.all(
      `SELECT COUNT(*) as count FROM guest_visit_requests 
       WHERE assigned_guest_room_id = ? 
       AND status IN ('approved', 'checked_in')
       AND check_out > ? AND check_in < ?`,
      [req.body.assigned_guest_room_id, checkIn.toISOString(), checkOut.toISOString()]
    );

    if (overlapping[0].count > 0) {
      return res.status(409).json({ success: false, message: 'Room not available for selected dates' });
    }

    await db.run(
      'UPDATE guest_visit_requests SET status = ?, assigned_guest_room_id = ?, max_overstay_checked = 1 WHERE id = ?',
      ['approved', req.body.assigned_guest_room_id, req.params.id]
    );

    // Log to audit
    await db.run(
      'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'GUEST_REQUEST_APPROVED', JSON.stringify({ request_id: req.params.id, room_id: req.body.assigned_guest_room_id })]
    );

    const updated = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject guest request
router.post('/:id/reject', authMiddleware, requireRole('warden', 'caretaker', 'superadmin'), async (req, res) => {
  try {
    const request = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    await db.run('UPDATE guest_visit_requests SET status = ? WHERE id = ?', ['rejected', req.params.id]);
    
    const updated = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check-in guest
router.post('/:id/checkin', authMiddleware, requireRole('warden', 'caretaker', 'superadmin'), async (req, res) => {
  try {
    const request = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    await db.run('UPDATE guest_visit_requests SET status = ? WHERE id = ?', ['checked_in', req.params.id]);
    
    const updated = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check-out guest
router.post('/:id/checkout', authMiddleware, requireRole('warden', 'caretaker', 'superadmin'), async (req, res) => {
  try {
    const request = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    await db.run('UPDATE guest_visit_requests SET status = ? WHERE id = ?', ['completed', req.params.id]);
    
    const updated = await db.get('SELECT * FROM guest_visit_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
