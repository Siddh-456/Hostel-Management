const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('./env');

const DB_PATH = config.DB_PATH;
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

db.configure('busyTimeout', 10000);

const initialize = () => {
  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create tables
  db.serialize(() => {
    // Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('superadmin', 'warden', 'accountant', 'caretaker', 'student')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )`);

    // Students
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      program TEXT NOT NULL,
      year INTEGER NOT NULL,
      phone TEXT,
      emergency_contact TEXT, -- JSON
      hostel_eligible BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Hostel Blocks
    db.run(`CREATE TABLE IF NOT EXISTS hostel_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      remarks TEXT
    )`);

    // Rooms
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_id INTEGER,
      name TEXT NOT NULL,
      room_type TEXT CHECK(room_type IN ('student', 'guest')) NOT NULL,
      capacity INTEGER NOT NULL,
      description TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(block_id) REFERENCES hostel_blocks(id) ON DELETE SET NULL
    )`);

    // Room Allocations
    db.run(`CREATE TABLE IF NOT EXISTS room_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE,
      active BOOLEAN DEFAULT 1,
      allocated_by INTEGER,
      allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY(allocated_by) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Guest Visit Requests
    db.run(`CREATE TABLE IF NOT EXISTS guest_visit_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_student_id INTEGER NOT NULL,
      guest_name TEXT NOT NULL,
      guest_phone TEXT,
      guest_email TEXT,
      id_proof_path TEXT,
      id_proof_hash TEXT,
      guest_relation TEXT,
      check_in DATETIME NOT NULL,
      check_out DATETIME NOT NULL,
      nights_calculated INTEGER,
      max_overstay_checked BOOLEAN DEFAULT 0,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed', 'checked_in')) DEFAULT 'pending',
      assigned_guest_room_id INTEGER,
      fee_per_night DECIMAL(10, 2),
      payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      requested_by_user_id INTEGER,
      FOREIGN KEY(host_student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_guest_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY(requested_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Visitor Log
    db.run(`CREATE TABLE IF NOT EXISTS visitor_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_student_id INTEGER NOT NULL,
      visitor_name TEXT NOT NULL,
      visitor_phone TEXT,
      purpose TEXT,
      check_in DATETIME NOT NULL,
      check_out DATETIME,
      logged_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(host_student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(logged_by) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Payments
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      payment_for TEXT CHECK(payment_for IN ('hostel_fee', 'mess_fee', 'guest_fee', 'other')) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      method TEXT CHECK(method IN ('online', 'offline', 'card', 'upi', 'cash')) NOT NULL,
      txn_ref TEXT,
      recorded_by INTEGER,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL,
      FOREIGN KEY(recorded_by) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Fees
    db.run(`CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      fee_type TEXT CHECK(fee_type IN ('hostel_fee', 'mess_fee', 'guest_fee', 'other')) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      due_date DATE,
      paid BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    )`);

    // Complaints
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      room_id INTEGER,
      category TEXT,
      description TEXT,
      status TEXT CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY(assigned_to) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Transfer Requests
    db.run(`CREATE TABLE IF NOT EXISTS transfer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      from_room_id INTEGER,
      to_room_id INTEGER,
      reason TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_by INTEGER,
      processed_at DATETIME,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(from_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY(to_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY(processed_by) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Waitlist
    db.run(`CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      preferred_block INTEGER,
      priority INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(preferred_block) REFERENCES hostel_blocks(id) ON DELETE SET NULL
    )`);

    // Inventory
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )`);

    // Audit Log
    db.run(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // PII Deletion Log
    db.run(`CREATE TABLE IF NOT EXISTS pii_deletion_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reason TEXT
    )`);
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const exec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = { db, initialize, run, get, all, exec };
