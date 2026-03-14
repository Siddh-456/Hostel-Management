# Architecture Overview - Hostel Management System

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend: Vanilla HTML/CSS/JavaScript (SPA)                │
│  ├─ index.html (Entry Point)                               │
│  ├─ Router: Client-side page routing                       │
│  ├─ Pages: 20+ components for different roles              │
│  ├─ API Client: Fetch-based HTTP wrapper                   │
│  └─ State: localStorage for session persistence            │
│                                                               │
│  URL: file:///.../frontend-vanilla/index.html              │
│  Port: Browser native (no server needed)                    │
│                                                               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API Calls
                     │ Base URL: http://localhost:3000/api
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER (Express.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Server: Node.js + Express                                  │
│  Port: 3000                                                 │
│  Process: npm run dev (with nodemon for auto-reload)        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Middleware Stack                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 1. CORS (Cross-Origin Resource Sharing)           │   │
│  │ 2. JSON Parser (express.json)                     │   │
│  │ 3. Auth Middleware (JWT validation)               │   │
│  │ 4. Role-Based Access Control                      │   │
│  │ 5. Error Handler                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 16 Route Modules (54+ Endpoints)                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • auth.js            (3 endpoints)                │   │
│  │ • users.js           (4 endpoints)                │   │
│  │ • rooms.js           (5 endpoints)                │   │
│  │ • blocks.js          (3 endpoints)                │   │
│  │ • allocations.js     (3 endpoints)                │   │
│  │ • guest-requests.js  (7 endpoints) ⭐ CAPACITY CHECK │   │
│  │ • visitor-log.js     (2 endpoints)                │   │
│  │ • fees.js            (3 endpoints)                │   │
│  │ • payments.js        (2 endpoints)                │   │
│  │ • complaints.js      (4 endpoints)                │   │
│  │ • transfers.js       (4 endpoints)                │   │
│  │ • waitlist.js        (3 endpoints)                │   │
│  │ • inventory.js       (3 endpoints)                │   │
│  │ • audit.js           (2 endpoints)                │   │
│  │ • pii.js             (3 endpoints)                │   │
│  │ • uploads.js         (2 endpoints)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Business Logic                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • Capacity Checking (prevents overbooking)        │   │
│  │ • Night Calculation (max 3 consecutive nights)    │   │
│  │ • File Validation (type, size, content)           │   │
│  │ • Role-Based Authorization                        │   │
│  │ • Audit Logging (critical actions)                │   │
│  │ • Password Hashing (bcryptjs)                     │   │
│  │ • JWT Token Generation/Validation                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL Queries
                     │ Database: SQLite
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER (SQLite)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Database File: backend/data/hostel.db                      │
│  Type: SQLite3 (file-based, portable)                       │
│  Tables: 15 (normalized schema)                             │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ IDENTITY & ACCESS CONTROL                          │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ • users (ID, name, email, password_hash, role)   │    │
│  │ • students (user_id, phone, DOB, admission_date) │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ROOM MANAGEMENT                                    │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ • hostel_blocks (name, location)                 │    │
│  │ • rooms (block_id, capacity, room_type)          │    │
│  │ • room_allocations (student_id, room_id, dates)  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ GUEST & VISITOR MANAGEMENT                        │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ • guest_visit_requests (approval workflow)        │    │
│  │ • visitor_log (check-in/out tracking)             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ FINANCIAL & OPERATIONAL                           │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ • fees (hostel charges)                           │    │
│  │ • payments (payment records)                      │    │
│  │ • complaints (issue tracking)                     │    │
│  │ • transfer_requests (room changes)                │    │
│  │ • waitlist (availability queue)                   │    │
│  │ • inventory (equipment tracking)                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ COMPLIANCE & SECURITY                             │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ • audit_log (system activity, timestamps)         │    │
│  │ • pii_deletion_log (GDPR deletion workflow)       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  Key Features:                                               │
│  ├─ Normalized schema (reduce redundancy)                   │
│  ├─ Foreign keys with cascade rules                         │
│  ├─ Indexes on common query fields                          │
│  ├─ Timestamps for audit trail                             │
│  └─ Status enums for state tracking                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram: Guest Request Workflow

```
┌──────────────┐
│   STUDENT    │
└──────┬───────┘
       │
       │ 1. Submit guest request
       │    (name, dates, ID proof)
       ▼
   ┌──────────────────────┐
   │ guest_visit_requests │
   │  status: pending     │
   └──────┬───────────────┘
          │
          │ API: POST /api/guest-requests
          │ (multipart file upload)
          ▼
   ┌─────────────────────────┐
   │ Frontend validates:     │
   │ • Date range OK?        │
   │ • Nights ≤ 3?           │
   │ • File type OK?         │
   │ • File size < 5MB?      │
   └──────┬──────────────────┘
          │
          │ Backend validates:
          ├─ express-validator
          │  (same checks)
          │
          │ 2. Store in database
          │    (status: pending)
          ▼
   ┌──────────────────────┐
   │     WARDEN/ADMIN     │ ← 3. Review request
   └──────┬───────────────┘
          │
          │ 4. Approve & assign room
          │    API: POST /api/guest-requests/:id/approve
          │    Payload: { room_id: 3 }
          ▼
   ┌────────────────────────────┐
   │ Backend checks:            │
   │ • Room capacity OK?        │
   │ • Date overlap? (SQL query)│
   │ If conflict → 409 response │
   │ (prevent overbooking)      │
   └──────┬─────────────────────┘
          │
          │ No conflict:
          │ • Update status: approved
          │ • Assign room_id
          │ • Log in audit_log
          ▼
   ┌──────────────────────┐
   │     STUDENT          │ ← 5. Check-in guest
   └──────┬───────────────┘
          │
          │ API: POST /api/guest-requests/:id/checkin
          ▼
   ┌────────────────────────┐
   │ • Update status: checked_in
   │ • Create visitor_log
   │ • Record check_in time
   └──────┬─────────────────┘
          │
          │ Guest stays (max 3 nights)
          │
          │ 6. Check-out guest
          │    API: POST /api/guest-requests/:id/checkout
          ▼
   ┌─────────────────────────┐
   │ • Update status: completed
   │ • Record check_out time
   │ • Close visitor_log
   │ • Update audit_log
   └─────────────────────────┘
```

---

## Authentication & Authorization Flow

```
┌────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                    │
├────────────────────────────────────────────────────────────┤
│                                                               │
│ Frontend:                                                    │
│ ├─ User enters email + password                             │
│ ├─ POST /api/auth/login                                     │
│ └─ Receive JWT token                                        │
│                                                               │
│ Backend (auth.js):                                           │
│ ├─ Find user by email                                       │
│ ├─ Compare password (bcryptjs)                              │
│ ├─ If match: Generate JWT token (7-day expiry)             │
│ ├─ Update last_login timestamp                              │
│ └─ Return token + user object                               │
│                                                               │
└────────────────────────────────────────────────────────────┘
         │
         │ Token stored in localStorage
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│ 2. API REQUESTS                                             │
├────────────────────────────────────────────────────────────┤
│                                                               │
│ Frontend:                                                    │
│ ├─ GET token from localStorage                              │
│ ├─ Add header: Authorization: Bearer <token>                │
│ └─ Send request                                             │
│                                                               │
│ Backend Middleware (auth.js):                                │
│ ├─ Extract token from header                                │
│ ├─ Verify with JWT_SECRET                                   │
│ ├─ Decode user info                                         │
│ ├─ Attach to req.user                                       │
│ └─ Next route handler                                       │
│                                                               │
│ Role-Based Access (requireRole middleware):                 │
│ ├─ Check req.user.role                                      │
│ ├─ If not authorized → 403 response                         │
│ ├─ If authorized → Continue                                 │
│ └─ Log action in audit_log                                  │
│                                                               │
└────────────────────────────────────────────────────────────┘
         │
         │ Token expires after 7 days
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│ 3. TOKEN EXPIRATION                                         │
├────────────────────────────────────────────────────────────┤
│                                                               │
│ Backend:                                                     │
│ ├─ JWT verification fails                                   │
│ ├─ Return 401 Unauthorized                                  │
│                                                              │
│ Frontend:                                                    │
│ ├─ Catch 401 response                                       │
│ ├─ Clear localStorage token                                 │
│ ├─ Redirect to login page                                   │
│ └─ User must re-authenticate                                │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## Capacity Checking Logic (Prevent Overbooking)

```
User tries to approve guest request for Room A (capacity: 2)
for dates: Feb 10-12

                        ▼
        
SQL Query:
SELECT * FROM guest_visit_requests
WHERE room_id = 3
  AND status IN ('approved', 'checked_in')
  AND check_in_date < '2024-02-12'
  AND check_out_date > '2024-02-10'

                        ▼

Results:
┌─────────────────────────────────────────┐
│ Existing booking #1: Feb 10-11 (1 guest)│
│ Existing booking #2: Feb 11-12 (1 guest)│
└─────────────────────────────────────────┘

Current occupancy:
├─ Feb 10: 1 guest (+ 1 new = 2/2) ✅ OK
├─ Feb 11: 2 guests (+ 1 new = 3/2) ❌ FULL
└─ Feb 12: 1 guest (+ 1 new = 2/2) ✅ OK

                        ▼

Response: HTTP 409 Conflict
{
  "success": false,
  "message": "Room capacity exceeded on Feb 11"
}

User must choose different room or dates
```

---

## File Upload Flow

```
┌─────────────────────────────────────────┐
│ Frontend: Guest Request Form             │
│ File Input: ID Proof (PDF/JPG/PNG)       │
└──────────┬──────────────────────────────┘
           │
           │ 1. Client-side validation
           │    ├─ File type check
           │    ├─ File size check (< 5MB)
           │    └─ Preview image
           ▼
┌──────────────────────────────────────────┐
│ FormData multipart/form-data             │
│ ├─ host_student_id                      │
│ ├─ guest_name                           │
│ ├─ check_in_date                        │
│ ├─ check_out_date                       │
│ └─ id_proof (binary file data)           │
└──────────┬───────────────────────────────┘
           │
           │ POST /api/guest-requests
           ▼
┌──────────────────────────────────────────┐
│ Backend Middleware: multer                │
│ ├─ Receive file stream                  │
│ ├─ Save to uploads/ directory            │
│ ├─ Generate filename (unique)            │
│ └─ Attach file info to req.file          │
└──────────┬───────────────────────────────┘
           │
           │ 2. Server-side validation
           │    ├─ MIME type check
           │    ├─ File size check (express middleware)
           │    └─ Express-validator checks
           ▼
┌──────────────────────────────────────────┐
│ Validation passes:                       │
│ ├─ Save metadata in database             │
│ ├─ Store file path: uploads/req_5_123.pdf│
│ └─ Return 201 Created                    │
│                                          │
│ Validation fails:                        │
│ ├─ Delete uploaded file                  │
│ ├─ Return 400 Bad Request                │
│ └─ Error message to user                 │
└──────────────────────────────────────────┘
```

---

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ WEB SERVER (Nginx/Apache)                        │  │
│  │ ├─ HTTPS/SSL termination                        │  │
│  │ ├─ Static file serving (frontend)               │  │
│  │ └─ Reverse proxy to Express backend             │  │
│  └──────┬───────────────────────────────────────────┘  │
│         │                                                │
│         ├─ Request /uploads/* → Node.js (file handler) │
│         ├─ Request /api/* → Node.js (Express routes)   │
│         └─ Request / → Static HTML/CSS/JS              │
│         │                                                │
│  ┌──────▼───────────────────────────────────────────┐  │
│  │ NODE.JS BACKEND (Express.js)                    │  │
│  │ ├─ Process manager: PM2                         │  │
│  │ │  └─ Auto-restart on crash                    │  │
│  │ ├─ Worker processes (cluster mode)              │  │
│  │ ├─ Environment: production                      │  │
│  │ └─ Port: 3000 (internal only)                   │  │
│  └──────┬───────────────────────────────────────────┘  │
│         │                                                │
│  ┌──────▼───────────────────────────────────────────┐  │
│  │ DATABASE (SQLite or PostgreSQL)                 │  │
│  │ ├─ Daily backups (automated)                    │  │
│  │ ├─ Replication (if using PostgreSQL)            │  │
│  │ ├─ Encryption at rest                           │  │
│  │ └─ Connection pooling                           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ FILE STORAGE                                    │  │
│  │ ├─ Local: /var/hostel/uploads                  │  │
│  │ ├─ Or: AWS S3, Google Cloud Storage            │  │
│  │ └─ Backup: Daily snapshots                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ LOGGING & MONITORING                            │  │
│  │ ├─ Application logs (PM2)                       │  │
│  │ ├─ Database logs                                │  │
│  │ ├─ Web server logs (Nginx)                      │  │
│  │ └─ Monitoring: Uptime, CPU, memory              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | HTML/CSS/JavaScript | ES6+ | Single-page app |
| Backend | Node.js + Express.js | 18+ / 4.x | REST API |
| Database | SQLite (or PostgreSQL) | 3.x | Data storage |
| Auth | JWT + bcryptjs | 9.x / 2.x | Security |
| File Upload | Multer | 1.4+ | File handling |
| Validation | express-validator | 7.x | Input sanitization |
| CORS | cors | 2.8+ | Cross-origin requests |
| Process Mgmt | PM2 / nodemon | 3.x / 1.x | Deployment / dev |

---

**Architecture Version: 1.0**
**Last Updated: [Current Date]**
