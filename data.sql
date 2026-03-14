INSERT INTO users (email, password_hash, full_name, role, created_at) VALUES
('admin@college.edu', 'hashed_admin_pw', 'Dr. Neha Sharma', 'superadmin', NOW()),
('warden@college.edu', 'hashed_warden_pw', 'Prof. Rajesh Singh', 'warden', NOW()),
('accountant@college.edu', 'hashed_account_pw', 'Anita Kapoor', 'accountant', NOW()),
('caretaker@college.edu', 'hashed_caretaker_pw', 'Ravi Kumar', 'caretaker', NOW()),
('s101@students.edu', 'hashed_student_pw1', 'Ishan Maurya', 'student', NOW()),
('s102@students.edu', 'hashed_student_pw2', 'Priya Verma', 'student', NOW()),
('s103@students.edu', 'hashed_student_pw3', 'Arjun Patel', 'student', NOW()),
('s104@students.edu', 'hashed_student_pw4', 'Simran Kaur', 'student', NOW());

INSERT INTO students (user_id, roll_number, program, year, phone, emergency_contact, hostel_eligible) VALUES
(5, 'BT2025CSE101', 'B.Tech CSE', 3, '9876543210', JSON_OBJECT('name', 'Raj Maurya', 'phone', '9811111111', 'relation', 'Father'), TRUE),
(6, 'BT2025ECE102', 'B.Tech ECE', 3, '9876543211', JSON_OBJECT('name', 'Manoj Verma', 'phone', '9822222222', 'relation', 'Father'), TRUE),
(7, 'BT2025ME103', 'B.Tech ME', 3, '9876543212', JSON_OBJECT('name', 'Sunita Patel', 'phone', '9833333333', 'relation', 'Mother'), TRUE),
(8, 'BT2025IT104', 'B.Tech IT', 3, '9876543213', JSON_OBJECT('name', 'Harjeet Kaur', 'phone', '9844444444', 'relation', 'Mother'), TRUE);

INSERT INTO hostel_blocks (name, location, remarks) VALUES
('A Block', 'North Wing', 'For 3rd-year students'),
('B Block', 'East Wing', 'For 2nd-year students'),
('Guest Block', 'Main Gate', 'For visiting parents/guests');

INSERT INTO rooms (block_id, name, room_type, capacity, description, active) VALUES
(1, 'A-101', 'student', 2, '2-seater room with balcony', TRUE),
(1, 'A-102', 'student', 2, '2-seater room near study area', TRUE),
(2, 'B-201', 'student', 3, '3-seater with shared bathroom', TRUE),
(3, 'G-01', 'guest', 2, 'AC guest room with attached bath', TRUE),
(3, 'G-02', 'guest', 1, 'Single guest room, non-AC', TRUE);

INSERT INTO room_allocations (student_id, room_id, check_in_date, active, allocated_by) VALUES
(1, 1, '2025-07-01', TRUE, 2),
(2, 1, '2025-07-01', TRUE, 2),
(3, 2, '2025-07-01', TRUE, 2),
(4, 3, '2025-07-01', TRUE, 2);

INSERT INTO fees (student_id, fee_type, amount, due_date, paid) VALUES
(1, 'hostel_fee', 25000, '2025-08-01', TRUE),
(2, 'hostel_fee', 25000, '2025-08-01', FALSE),
(3, 'hostel_fee', 25000, '2025-08-01', TRUE),
(4, 'mess_fee', 12000, '2025-08-01', FALSE);

INSERT INTO payments (student_id, payment_for, amount, method, txn_ref, recorded_by) VALUES
(1, 'hostel_fee', 25000, 'upi', 'TXNUPI001', 3),
(3, 'hostel_fee', 25000, 'online', 'TXNWEB002', 3),
(1, 'guest_fee', 800, 'cash', 'GUESTPAY001', 3);

INSERT INTO guest_visit_requests (host_student_id, guest_name, guest_phone, guest_relation, check_in, check_out, status, assigned_guest_room_id, fee_per_night, payment_id, requested_by_user_id)
VALUES
(1, 'Ravi Maurya', '9812345678', 'Brother', '2025-11-18 10:00:00', '2025-11-20 09:00:00', 'approved', 4, 400, 'GUESTPAY001', 5),
(2, 'Anjali Verma', '9823456789', 'Sister', '2025-11-22 11:00:00', '2025-11-23 09:00:00', 'pending', NULL, 400, NULL, 6);

INSERT INTO visitor_log (host_student_id, visitor_name, visitor_phone, purpose, check_in, check_out, logged_by)
VALUES
(3, 'Vivek Mehta', '9876500001', 'Project Discussion', '2025-11-10 09:30:00', '2025-11-10 12:30:00', 4),
(4, 'Rohit Kaur', '9876500002', 'Family Visit', '2025-11-11 14:00:00', '2025-11-11 18:00:00', 4);

INSERT INTO complaints (student_id, room_id, category, description, status, assigned_to)
VALUES
(1, 1, 'Electrical', 'Fan not working properly', 'open', 4),
(2, 1, 'Plumbing', 'Water leakage in bathroom', 'in_progress', 4),
(3, 2, 'Cleanliness', 'Room not cleaned this week', 'resolved', 4);

INSERT INTO transfer_requests (student_id, from_room_id, to_room_id, reason, status, requested_at)
VALUES
(2, 1, 2, 'Wants quieter environment', 'pending', NOW()),
(4, 3, 1, 'Closer to classmates', 'rejected', NOW());

INSERT INTO waitlist (student_id, preferred_block, priority)
VALUES
(2, 1, 10),
(3, 2, 15);

INSERT INTO inventory (room_id, item_name, quantity)
VALUES
(1, 'Bed', 2),
(1, 'Table', 2),
(3, 'Fan', 1),
(4, 'AC', 1),
(5, 'Chair', 2);

INSERT INTO audit_log (user_id, action, details)
VALUES
(2, 'allocate_room', JSON_OBJECT('student_id', 1, 'room_id', 1)),
(2, 'approve_guest', JSON_OBJECT('guest_id', 1, 'room_id', 4)),
(3, 'record_payment', JSON_OBJECT('txn', 'TXNUPI001', 'amount', 25000));

INSERT INTO pii_deletion_log (table_name, record_id, reason)
VALUES
('guest_visit_requests', '1', 'Deleted old ID proof as per retention policy');
