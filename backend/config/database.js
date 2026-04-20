const { Pool, types } = require('pg');
const config = require('./env');

// Keep API responses close to the previous database helper behavior.
types.setTypeParser(types.builtins.INT8, (value) => Number(value));
types.setTypeParser(types.builtins.NUMERIC, (value) => Number(value));

const pool = new Pool(config.POSTGRES_CONFIG);
let hasLoggedConnection = false;
let initializePromise;

const logConnection = async () => {
  if (hasLoggedConnection) {
    return;
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT current_database() AS database_name');
    console.log(`Connected to PostgreSQL database: ${rows[0].database_name}`);
    hasLoggedConnection = true;
  } finally {
    client.release();
  }
};

const SCHEMA_SQL = `
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
    user_id INTEGER UNIQUE NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    program TEXT NOT NULL,
    year INTEGER NOT NULL,
    phone TEXT,
    emergency_contact TEXT,
    hostel_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS hostel_blocks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    remarks TEXT
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    block_id INTEGER,
    name TEXT NOT NULL,
    room_type TEXT CHECK(room_type IN ('student', 'guest')) NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(block_id) REFERENCES hostel_blocks(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS room_allocations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    room_id INTEGER,
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    active BOOLEAN DEFAULT TRUE,
    allocated_by INTEGER,
    allocated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY(allocated_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS guest_visit_requests (
    id SERIAL PRIMARY KEY,
    host_student_id INTEGER NOT NULL,
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
    assigned_guest_room_id INTEGER,
    fee_per_night NUMERIC(10, 2),
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    requested_by_user_id INTEGER,
    FOREIGN KEY(host_student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(assigned_guest_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY(requested_by_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS visitor_log (
    id SERIAL PRIMARY KEY,
    host_student_id INTEGER NOT NULL,
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    purpose TEXT,
    check_in TIMESTAMPTZ NOT NULL,
    check_out TIMESTAMPTZ,
    logged_by INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(host_student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(logged_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER,
    payment_for TEXT CHECK(payment_for IN ('hostel_fee', 'mess_fee', 'guest_fee', 'other')) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    method TEXT CHECK(method IN ('online', 'offline', 'card', 'upi', 'cash')) NOT NULL,
    txn_ref TEXT,
    recorded_by INTEGER,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY(recorded_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER,
    fee_type TEXT CHECK(fee_type IN ('hostel_fee', 'mess_fee', 'guest_fee', 'other')) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE,
    paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    student_id INTEGER,
    room_id INTEGER,
    category TEXT,
    description TEXT,
    status TEXT CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    assigned_to INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY(assigned_to) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS transfer_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    from_room_id INTEGER,
    to_room_id INTEGER,
    reason TEXT,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_by INTEGER,
    processed_at TIMESTAMPTZ,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(from_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY(to_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY(processed_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    preferred_block INTEGER,
    priority INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY(preferred_block) REFERENCES hostel_blocks(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    room_id INTEGER,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS pii_deletion_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_rooms_block_id ON rooms(block_id);
  CREATE INDEX IF NOT EXISTS idx_room_allocations_student_id ON room_allocations(student_id);
  CREATE INDEX IF NOT EXISTS idx_room_allocations_room_id ON room_allocations(room_id);
  CREATE INDEX IF NOT EXISTS idx_guest_visit_requests_host_student_id ON guest_visit_requests(host_student_id);
  CREATE INDEX IF NOT EXISTS idx_guest_visit_requests_status ON guest_visit_requests(status);
  CREATE INDEX IF NOT EXISTS idx_guest_visit_requests_assigned_guest_room_id ON guest_visit_requests(assigned_guest_room_id);
  CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
  CREATE INDEX IF NOT EXISTS idx_complaints_room_id ON complaints(room_id);
`;

const toPostgresPlaceholders = (sql) => {
  let position = 0;
  return sql.replace(/\?/g, () => `$${++position}`);
};

const initialize = async (force = false) => {
  if (force || !initializePromise) {
    initializePromise = (async () => {
      await logConnection();
      await pool.query(SCHEMA_SQL);
    })();
  }

  return initializePromise;
};

const run = async (sql, params = []) => {
  const normalizedSql = toPostgresPlaceholders(sql.trim());
  const text = /^\s*insert\b/i.test(normalizedSql) && !/\breturning\b/i.test(normalizedSql)
    ? `${normalizedSql} RETURNING id`
    : normalizedSql;
  const result = await pool.query(text, params);

  return {
    id: result.rows[0]?.id ?? null,
    changes: result.rowCount
  };
};

const get = async (sql, params = []) => {
  const result = await pool.query(toPostgresPlaceholders(sql), params);
  return result.rows[0];
};

const all = async (sql, params = []) => {
  const result = await pool.query(toPostgresPlaceholders(sql), params);
  return result.rows || [];
};

const exec = async (sql) => {
  await pool.query(sql);
};

module.exports = {
  db: pool,
  pool,
  initialize,
  run,
  get,
  all,
  exec
};
