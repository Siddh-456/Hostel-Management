-- PostgreSQL schema for the Hostel Management System

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK(role IN ('superadmin', 'warden', 'accountant', 'caretaker', 'student')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roll_number TEXT UNIQUE NOT NULL,
  program TEXT NOT NULL,
  year INTEGER NOT NULL,
  phone TEXT,
  emergency_contact TEXT,
  hostel_eligible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostel_blocks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  remarks TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  block_id INTEGER REFERENCES hostel_blocks(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  room_type TEXT CHECK(room_type IN ('student', 'guest')) NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_allocations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  active BOOLEAN DEFAULT TRUE,
  allocated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  allocated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guest_visit_requests (
  id SERIAL PRIMARY KEY,
  host_student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  id_proof_path TEXT,
  id_proof_hash TEXT,
  guest_relation TEXT,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ NOT NULL,
  nights_calculated INTEGER,
  max_overstay_checked BOOLEAN DEFAULT FALSE,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed', 'checked_in')) DEFAULT 'pending',
  assigned_guest_room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  fee_per_night NUMERIC(10, 2),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  requested_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS visitor_log (
  id SERIAL PRIMARY KEY,
  host_student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  purpose TEXT,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  logged_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  payment_for TEXT CHECK(payment_for IN ('hostel_fee', 'mess_fee', 'guest_fee', 'other')) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  method TEXT CHECK(method IN ('online', 'offline', 'card', 'upi', 'cash')) NOT NULL,
  txn_ref TEXT,
  recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fees (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  fee_type TEXT CHECK(fee_type IN ('hostel_fee', 'mess_fee', 'guest_fee', 'other')) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  category TEXT,
  description TEXT,
  status TEXT CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS transfer_requests (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  to_room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  reason TEXT,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  preferred_block INTEGER REFERENCES hostel_blocks(id) ON DELETE SET NULL,
  priority INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pii_deletion_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);
