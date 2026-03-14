# API Cheat Sheet - Hostel Management System

Quick reference for all backend API endpoints.

## 🔐 Authentication

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@hostel.com",
  "password": "admin123"
}

# Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@hostel.com",
      "role": "superadmin"
    }
  }
}
```

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "New Student",
  "email": "new@student.com",
  "password": "pass123",
  "role": "student"
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 👥 Users

### List Users (admin only)
```bash
GET /api/users?role=student&status=active
Authorization: Bearer <token>
```

### Get User
```bash
GET /api/users/:id
Authorization: Bearer <token>
```

### Create User (admin only)
```bash
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@hostel.com",
  "password": "secure123",
  "role": "warden"
}
```

### Update User
```bash
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "accountant",
  "status": "active"
}
```

---

## 🏢 Blocks & Rooms

### List Blocks
```bash
GET /api/blocks
Authorization: Bearer <token>
```

### Create Block (warden only)
```bash
POST /api/blocks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Block A",
  "location": "North Campus",
  "remarks": "Main boys block"
}
```

### List Rooms
```bash
GET /api/rooms?block_id=1
Authorization: Bearer <token>
```

### Create Room
```bash
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "block_id": 1,
  "name": "Room 101",
  "room_type": "student",
  "capacity": 2,
  "description": "Standard double room"
}
```

---

## 🏠 Allocations

### List Allocations
```bash
GET /api/allocations?student_id=5
Authorization: Bearer <token>
```

### Create Allocation
```bash
POST /api/allocations
Authorization: Bearer <token>
Content-Type: application/json

{
  "student_id": 5,
  "room_id": 3,
  "check_in_date": "2024-01-15"
}
```

---

## 👥 Guest Requests

### List Guest Requests
```bash
GET /api/guest-requests?status=pending&host_student_id=5
Authorization: Bearer <token>
```

### Create Guest Request (with file upload)
```bash
POST /api/guest-requests
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- host_student_id: 5
- guest_name: "John Visitor"
- check_in_date: "2024-02-10"
- check_out_date: "2024-02-12"
- id_proof: [file]
- phone: "9876543210"
```

### Approve Guest Request
```bash
POST /api/guest-requests/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "room_id": 3
}

# Returns 409 if room capacity exceeded (overbooking)
```

### Reject Guest Request
```bash
POST /api/guest-requests/:id/reject
Authorization: Bearer <token>
```

### Check-in Guest
```bash
POST /api/guest-requests/:id/checkin
Authorization: Bearer <token>
```

### Check-out Guest
```bash
POST /api/guest-requests/:id/checkout
Authorization: Bearer <token>
```

---

## 📝 Visitor Log

### Create Visitor Log
```bash
POST /api/visitor-log
Authorization: Bearer <token>
Content-Type: application/json

{
  "host_student_id": 5,
  "visitor_name": "Parent",
  "visitor_phone": "9999999999",
  "purpose": "Meeting",
  "check_in": "2024-02-10T10:00:00"
}
```

### List Visitor Logs
```bash
GET /api/visitor-log?host_student_id=5
Authorization: Bearer <token>
```

---

## 💰 Fees & Payments

### List Fees
```bash
GET /api/fees?student_id=5&year=2024
Authorization: Bearer <token>
```

### Create Fee (accountant only)
```bash
POST /api/fees
Authorization: Bearer <token>
Content-Type: application/json

{
  "student_id": 5,
  "amount": 50000,
  "description": "Hostel fees 2024",
  "academic_year": "2024",
  "due_date": "2024-03-31"
}
```

### Mark Fee as Paid
```bash
POST /api/fees/:id/mark-paid
Authorization: Bearer <token>
```

### Record Payment
```bash
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "student_id": 5,
  "amount": 50000,
  "payment_method": "cash",
  "transaction_id": "TXN123456"
}
```

### List Payments
```bash
GET /api/payments?student_id=5&status=completed
Authorization: Bearer <token>
```

---

## 🔧 Complaints

### Create Complaint
```bash
POST /api/complaints
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "maintenance",
  "description": "Water leakage in bathroom"
}
```

### List Complaints
```bash
GET /api/complaints?status=open&category=maintenance
Authorization: Bearer <token>
```

### Update Complaint Status
```bash
POST /api/complaints/:id/update-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "resolution": "Pipe replaced successfully"
}
```

---

## 🔄 Transfers & Waitlist

### Request Room Transfer
```bash
POST /api/transfer-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "from_room_id": 3,
  "to_room_id": 5,
  "reason": "Too noisy"
}
```

### Approve Transfer
```bash
POST /api/transfer-requests/:id/approve
Authorization: Bearer <token>
```

### Add to Waitlist
```bash
POST /api/waitlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "room_id": 2,
  "priority": "normal"
}
```

### List Waitlist
```bash
GET /api/waitlist?room_id=2
Authorization: Bearer <token>
```

---

## 📦 Inventory

### List Inventory
```bash
GET /api/inventory?room_id=3&category=furniture
Authorization: Bearer <token>
```

### Add Inventory Item
```bash
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "room_id": 3,
  "item_name": "Double Bed",
  "category": "furniture",
  "quantity": 2,
  "condition": "good"
}
```

### Update Inventory
```bash
PUT /api/inventory/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 1,
  "condition": "damaged"
}
```

---

## 📋 Audit & Compliance

### List Audit Logs (admin only)
```bash
GET /api/audit-log?action=approved&user_id=1
Authorization: Bearer <token>
```

### Request PII Deletion
```bash
POST /api/pii-deletion-log/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "student_id": 5
}
```

### Execute PII Deletion (admin only)
```bash
POST /api/pii-deletion-log/:id/execute
Authorization: Bearer <token>
```

---

## 📁 File Upload

### Download File
```bash
GET /api/uploads/filename.pdf
Authorization: Bearer <token>
```

### Delete File (staff only)
```bash
DELETE /api/uploads/filename.pdf
Authorization: Bearer <token>
```

---

## 🔑 Authorization Levels

| Role | Can Access |
|------|-----------|
| **superadmin** | All endpoints |
| **warden** | User mgmt, rooms, blocks, allocations, approvals |
| **accountant** | Fees, payments, audit log |
| **caretaker** | Complaints, inventory, visitor log |
| **student** | Own data, submit requests, view own records |

---

## ⚠️ Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (e.g., room capacity exceeded) |
| 500 | Server error |

---

## 🎯 Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🧪 Example Workflow: Guest Visit Approval

```bash
# 1. Student creates guest request
curl -X POST http://localhost:3000/api/guest-requests \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -F "host_student_id=5" \
  -F "guest_name=Parent" \
  -F "check_in_date=2024-02-10" \
  -F "check_out_date=2024-02-12" \
  -F "id_proof=@passport.pdf"

# 2. Warden approves and assigns room
curl -X POST http://localhost:3000/api/guest-requests/1/approve \
  -H "Authorization: Bearer WARDEN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 3}'

# 3. Student checks in guest
curl -X POST http://localhost:3000/api/guest-requests/1/checkin \
  -H "Authorization: Bearer STUDENT_TOKEN"

# 4. Visitor log auto-created, student checks out
curl -X POST http://localhost:3000/api/guest-requests/1/checkout \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

---

*Quick Reference | Backend API v1.0*
