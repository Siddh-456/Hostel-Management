const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users
router.get('/', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    let query = 'SELECT id, name, email, role, status, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (req.query.role) {
      query += ' AND role = ?';
      params.push(req.query.role);
    }

    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }

    const users = await db.all(query, params);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user (admin only)
router.post('/', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    }

    if (!['student', 'caretaker', 'accountant', 'warden', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Check if email exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, 'active', new Date().toISOString()]
    );

    const user = await db.get('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/:id', authMiddleware, requireRole('superadmin', 'warden'), async (req, res) => {
  try {
    const updates = [];
    const values = [];

    if (req.body.name) {
      updates.push('name = ?');
      values.push(req.body.name);
    }
    if (req.body.role) {
      updates.push('role = ?');
      values.push(req.body.role);
    }
    if (req.body.status) {
      updates.push('status = ?');
      values.push(req.body.status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const user = await db.get('SELECT id, name, email, role, status FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
