// Simple mock server using Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Load database
const dbPath = path.join(__dirname, 'db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Utility to save DB
const saveDb = () => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

// Mock auth token
const mockToken = 'mock-token';

// Middleware to validate token
const validateAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.includes(mockToken)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  res.json({
    success: true,
    data: {
      token: mockToken,
      user: user
    }
  });
});

app.get('/api/auth/me', validateAuth, (req, res) => {
  const user = db.users[1]; // Return first non-admin user
  res.json({ success: true, data: user });
});

// ============ USERS ============
app.get('/api/users', validateAuth, (req, res) => {
  res.json({ success: true, data: db.users });
});

// ============ ROOMS ============
app.get('/api/rooms', validateAuth, (req, res) => {
  res.json({ success: true, data: db.rooms });
});

app.get('/api/rooms/:id', validateAuth, (req, res) => {
  const room = db.rooms.find(r => r.id == req.params.id);
  if (!room) return res.status(404).json({ success: false });
  res.json({ success: true, data: room });
});

app.post('/api/rooms', validateAuth, (req, res) => {
  const room = { id: Math.max(...db.rooms.map(r => r.id)) + 1, ...req.body, created_at: new Date().toISOString() };
  db.rooms.push(room);
  saveDb();
  res.json({ success: true, data: room });
});

app.put('/api/rooms/:id', validateAuth, (req, res) => {
  const room = db.rooms.find(r => r.id == req.params.id);
  if (!room) return res.status(404).json({ success: false });
  Object.assign(room, req.body);
  saveDb();
  res.json({ success: true, data: room });
});

// ============ BLOCKS ============
app.get('/api/blocks', validateAuth, (req, res) => {
  res.json({ success: true, data: db.hostel_blocks });
});

app.post('/api/blocks', validateAuth, (req, res) => {
  const block = { id: Math.max(...db.hostel_blocks.map(b => b.id)) + 1, ...req.body };
  db.hostel_blocks.push(block);
  saveDb();
  res.json({ success: true, data: block });
});

// ============ ALLOCATIONS ============
app.get('/api/allocations', validateAuth, (req, res) => {
  let allocations = db.room_allocations;
  if (req.query.student_id) {
    allocations = allocations.filter(a => a.student_id == req.query.student_id);
  }
  res.json({ success: true, data: allocations });
});

app.post('/api/allocations', validateAuth, (req, res) => {
  const allocation = { id: Math.max(...db.room_allocations.map(a => a.id)) + 1, ...req.body, allocated_at: new Date().toISOString() };
  db.room_allocations.push(allocation);
  saveDb();
  res.json({ success: true, data: allocation });
});

// ============ GUEST REQUESTS ============
app.get('/api/guest-requests', validateAuth, (req, res) => {
  let requests = db.guest_visit_requests;
  if (req.query.status) requests = requests.filter(r => r.status === req.query.status);
  if (req.query.host_student_id) requests = requests.filter(r => r.host_student_id == req.query.host_student_id);
  res.json({ success: true, data: requests });
});

app.get('/api/guest-requests/:id', validateAuth, (req, res) => {
  const request = db.guest_visit_requests.find(r => r.id == req.params.id);
  if (!request) return res.status(404).json({ success: false });
  res.json({ success: true, data: request });
});

app.post('/api/guest-requests', validateAuth, (req, res) => {
  const request = {
    id: Math.max(...db.guest_visit_requests.map(r => r.id), 0) + 1,
    ...req.body,
    status: 'pending',
    created_at: new Date().toISOString(),
    requested_by_user_id: 5
  };
  db.guest_visit_requests.push(request);
  saveDb();
  res.json({ success: true, data: request });
});

app.post('/api/guest-requests/:id/approve', validateAuth, (req, res) => {
  const request = db.guest_visit_requests.find(r => r.id == req.params.id);
  if (!request) return res.status(404).json({ success: false });
  request.status = 'approved';
  request.assigned_guest_room_id = req.body.assigned_guest_room_id;
  saveDb();
  res.json({ success: true, data: request });
});

app.post('/api/guest-requests/:id/reject', validateAuth, (req, res) => {
  const request = db.guest_visit_requests.find(r => r.id == req.params.id);
  if (!request) return res.status(404).json({ success: false });
  request.status = 'rejected';
  saveDb();
  res.json({ success: true, data: request });
});

app.post('/api/guest-requests/:id/checkin', validateAuth, (req, res) => {
  const request = db.guest_visit_requests.find(r => r.id == req.params.id);
  if (!request) return res.status(404).json({ success: false });
  request.status = 'checked_in';
  saveDb();
  res.json({ success: true, data: request });
});

app.post('/api/guest-requests/:id/checkout', validateAuth, (req, res) => {
  const request = db.guest_visit_requests.find(r => r.id == req.params.id);
  if (!request) return res.status(404).json({ success: false });
  request.status = 'completed';
  saveDb();
  res.json({ success: true, data: request });
});

// ============ VISITOR LOG ============
app.post('/api/visitor-log', validateAuth, (req, res) => {
  const log = { id: Math.max(...db.visitor_log.map(l => l.id), 0) + 1, ...req.body, created_at: new Date().toISOString() };
  db.visitor_log.push(log);
  saveDb();
  res.json({ success: true, data: log });
});

// ============ FEES ============
app.get('/api/fees', validateAuth, (req, res) => {
  let fees = db.fees;
  if (req.query.student_id) fees = fees.filter(f => f.student_id == req.query.student_id);
  res.json({ success: true, data: fees });
});

app.post('/api/fees/:id/mark-paid', validateAuth, (req, res) => {
  const fee = db.fees.find(f => f.id == req.params.id);
  if (!fee) return res.status(404).json({ success: false });
  fee.paid = true;
  saveDb();
  res.json({ success: true, data: fee });
});

// ============ PAYMENTS ============
app.post('/api/payments', validateAuth, (req, res) => {
  const payment = { id: Math.max(...db.payments.map(p => p.id), 0) + 1, ...req.body, recorded_at: new Date().toISOString() };
  db.payments.push(payment);
  saveDb();
  res.json({ success: true, data: payment });
});

app.get('/api/payments', validateAuth, (req, res) => {
  let payments = db.payments;
  if (req.query.student_id) payments = payments.filter(p => p.student_id == req.query.student_id);
  res.json({ success: true, data: payments });
});

// ============ COMPLAINTS ============
app.post('/api/complaints', validateAuth, (req, res) => {
  const complaint = { id: Math.max(...db.complaints.map(c => c.id), 0) + 1, ...req.body, status: 'open', created_at: new Date().toISOString() };
  db.complaints.push(complaint);
  saveDb();
  res.json({ success: true, data: complaint });
});

app.get('/api/complaints', validateAuth, (req, res) => {
  res.json({ success: true, data: db.complaints });
});

app.post('/api/complaints/:id/update-status', validateAuth, (req, res) => {
  const complaint = db.complaints.find(c => c.id == req.params.id);
  if (!complaint) return res.status(404).json({ success: false });
  complaint.status = req.body.status;
  if (req.body.status === 'resolved') complaint.resolved_at = new Date().toISOString();
  saveDb();
  res.json({ success: true, data: complaint });
});

// ============ TRANSFER REQUESTS ============
app.post('/api/transfer-requests', validateAuth, (req, res) => {
  const transfer = { id: Math.max(...db.transfer_requests.map(t => t.id), 0) + 1, ...req.body, requested_at: new Date().toISOString() };
  db.transfer_requests.push(transfer);
  saveDb();
  res.json({ success: true, data: transfer });
});

app.get('/api/transfer-requests', validateAuth, (req, res) => {
  res.json({ success: true, data: db.transfer_requests });
});

// ============ WAITLIST ============
app.post('/api/waitlist', validateAuth, (req, res) => {
  const entry = { id: Math.max(...db.waitlist.map(w => w.id), 0) + 1, ...req.body, created_at: new Date().toISOString() };
  db.waitlist.push(entry);
  saveDb();
  res.json({ success: true, data: entry });
});

app.get('/api/waitlist', validateAuth, (req, res) => {
  res.json({ success: true, data: db.waitlist });
});

// ============ INVENTORY ============
app.get('/api/inventory', validateAuth, (req, res) => {
  let inventory = db.inventory;
  if (req.query.room_id) inventory = inventory.filter(i => i.room_id == req.query.room_id);
  res.json({ success: true, data: inventory });
});

app.post('/api/inventory', validateAuth, (req, res) => {
  const item = { id: Math.max(...db.inventory.map(i => i.id), 0) + 1, ...req.body, created_at: new Date().toISOString() };
  db.inventory.push(item);
  saveDb();
  res.json({ success: true, data: item });
});

// ============ AUDIT & PII ============
app.get('/api/audit-log', validateAuth, (req, res) => {
  res.json({ success: true, data: db.audit_log });
});

app.get('/api/pii-deletion-log', validateAuth, (req, res) => {
  res.json({ success: true, data: db.pii_deletion_log });
});

app.post('/api/pii-delete', validateAuth, (req, res) => {
  const log = { id: Math.max(...db.pii_deletion_log.map(l => l.id), 0) + 1, table_name: 'guest_visit_requests', record_id: Date.now().toString(), deleted_at: new Date().toISOString(), reason: 'Auto-delete' };
  db.pii_deletion_log.push(log);
  saveDb();
  res.json({ success: true, data: log });
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Available endpoints: /api/auth, /api/rooms, /api/guest-requests, /api/fees, etc.');
});
