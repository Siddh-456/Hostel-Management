-- MySQL / MariaDB compatible DDL for the Hostel Management System
-- Uses InnoDB and utf8mb4. Adjust engine/charset if needed.

SET @@foreign_key_checks = 0;

-- 1. Users (roles defined inline as ENUM on the column)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('superadmin','warden','accountant','caretaker','student') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Students (profile)
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  roll_number VARCHAR(128) UNIQUE,
  program VARCHAR(255),
  year INT,
  phone VARCHAR(32),
  emergency_contact JSON,
  hostel_eligible BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Hostel blocks & rooms
CREATE TABLE hostel_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  remarks TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  block_id INT NULL,
  name VARCHAR(128) NOT NULL, -- e.g., "B-2-101"
  room_type ENUM('student','guest') NOT NULL DEFAULT 'student',
  capacity INT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rooms_block FOREIGN KEY (block_id) REFERENCES hostel_blocks(id) ON DELETE SET NULL,
  CHECK (capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_rooms_block ON rooms(block_id);

-- 4. Room allocations (students)
CREATE TABLE room_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NULL,
  active BOOLEAN DEFAULT TRUE,
  allocated_by INT NULL,
  allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ra_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_ra_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ra_allocby FOREIGN KEY (allocated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_room_alloc_room ON room_allocations(room_id);
CREATE INDEX idx_room_alloc_student ON room_allocations(student_id);

-- 5. Guest visit requests (overnight)
CREATE TABLE guest_visit_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  host_student_id INT NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(32),
  guest_email VARCHAR(320),
  id_proof_path VARCHAR(1024), -- S3 key or file path
  id_proof_hash VARCHAR(128),
  guest_relation VARCHAR(128),
  check_in DATETIME NOT NULL,
  check_out DATETIME NOT NULL,
  nights_calculated INT AS (TIMESTAMPDIFF(DAY, check_in, check_out)) STORED,
  max_overstay_checked BOOLEAN DEFAULT FALSE,
  status ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
  assigned_guest_room_id INT NULL,
  fee_per_night DECIMAL(10,2) DEFAULT 0,
  payment_id VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  requested_by_user_id INT NULL,
  CONSTRAINT fk_gvr_host_student FOREIGN KEY (host_student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_gvr_assigned_room FOREIGN KEY (assigned_guest_room_id) REFERENCES rooms(id),
  CONSTRAINT fk_gvr_requested_by FOREIGN KEY (requested_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_guest_requests_host ON guest_visit_requests(host_student_id);
CREATE INDEX idx_guest_requests_status ON guest_visit_requests(status);
CREATE INDEX idx_guest_requests_assigned_room ON guest_visit_requests(assigned_guest_room_id);

-- 6. Visitor log (daytime visitors)
CREATE TABLE visitor_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  host_student_id INT NOT NULL,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(32),
  purpose TEXT,
  check_in DATETIME NOT NULL,
  check_out DATETIME NULL,
  logged_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_visitor_host FOREIGN KEY (host_student_id) REFERENCES students(id),
  CONSTRAINT fk_visitor_logged_by FOREIGN KEY (logged_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Payments
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NULL,
  payment_for ENUM('hostel_fee','mess_fee','guest_fee','other') NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  method ENUM('online','offline','card','upi','cash') NULL,
  txn_ref VARCHAR(255),
  recorded_by INT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_payments_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_payments_student ON payments(student_id);

-- 8. Fees (master per year / per student)
CREATE TABLE fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NULL,
  fee_type ENUM('hostel_fee','mess_fee','guest_fee','other') NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fees_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Complaints
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NULL,
  room_id INT NULL,
  category VARCHAR(255),
  description TEXT,
  status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  assigned_to INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  CONSTRAINT fk_complaints_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_complaints_room FOREIGN KEY (room_id) REFERENCES rooms(id),
  CONSTRAINT fk_complaints_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_complaints_room ON complaints(room_id);

-- 10. Transfer requests
CREATE TABLE transfer_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  from_room_id INT NULL,
  to_room_id INT NULL,
  reason TEXT,
  status ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_by INT NULL,
  processed_at DATETIME NULL,
  CONSTRAINT fk_tr_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_tr_from_room FOREIGN KEY (from_room_id) REFERENCES rooms(id),
  CONSTRAINT fk_tr_to_room FOREIGN KEY (to_room_id) REFERENCES rooms(id),
  CONSTRAINT fk_tr_processed_by FOREIGN KEY (processed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Waitlist
CREATE TABLE waitlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  preferred_block INT NULL,
  priority INT DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_waitlist_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_waitlist_block FOREIGN KEY (preferred_block) REFERENCES hostel_blocks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Inventory
CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NULL,
  item_name VARCHAR(255),
  quantity INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_room FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Audit / attendance log
CREATE TABLE audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(255),
  details JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. PII deletion log
CREATE TABLE pii_deletion_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(255),
  record_id VARCHAR(255),
  deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @@foreign_key_checks = 1;
