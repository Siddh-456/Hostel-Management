# Hostel Management System - Backend API

Express.js + SQLite3 REST API for hostel management with role-based access control.

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm 9+

### Installation Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env .env.local  # Copy template and customize if needed
   ```

3. **Seed database with demo data:**
   ```bash
   npm run seed
   ```
   
   This creates:
   - 7 test users (admin, warden, accountant, caretaker, 3 students)
   - 3 hostel blocks with 12 rooms
   - Room allocations for students
   - Sample guest requests, complaints, fees
   - Inventory items

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Server runs on `http://localhost:3000`

## Test Users (from seed.js)

| Email | Password | Role |
|-------|----------|------|
| admin@hostel.com | admin123 | superadmin |
| warden@hostel.com | warden123 | warden |
| accountant@hostel.com | acc123 | accountant |
| caretaker@hostel.com | care123 | caretaker |
| john@student.com | pass123 | student |
| jane@student.com | pass123 | student |
| bob@student.com | pass123 | student |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new student/caretaker
- `GET /api/auth/me` - Get current user (requires token)

### Users Management
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user (admin only)

### Rooms & Allocations
- `GET /api/blocks` - List hostel blocks
- `POST /api/blocks` - Create block (warden only)
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create room (warden only)
- `PUT /api/rooms/:id` - Update room (warden only)
- `GET /api/allocations` - List room allocations
- `POST /api/allocations` - Allocate room to student

### Guest Management
- `GET /api/guest-requests` - List guest visit requests
- `POST /api/guest-requests` - Create guest request (multipart)
- `POST /api/guest-requests/:id/approve` - Approve request with room assignment
- `POST /api/guest-requests/:id/checkin` - Mark guest checked in
- `POST /api/guest-requests/:id/checkout` - Mark guest checked out

### Fees & Payments
- `GET /api/fees` - List fees
- `POST /api/fees` - Create fee (accountant only)
- `POST /api/fees/:id/mark-paid` - Mark fee as paid
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

### Complaints & Transfers
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint
- `POST /api/complaints/:id/update-status` - Update complaint status
- `POST /api/transfer-requests` - Request room transfer
- `POST /api/transfer-requests/:id/approve` - Approve transfer

### Other Features
- `GET /api/visitor-log` - View visitor logs
- `POST /api/visitor-log` - Create visitor log
- `GET /api/inventory` - List inventory
- `POST /api/inventory` - Add inventory item
- `GET /api/waitlist` - View waitlist
- `POST /api/waitlist` - Add to waitlist
- `GET /api/audit-log` - View audit logs (admin only)
- `POST /api/pii-deletion-log/request` - Request data deletion
- `POST /api/pii-deletion-log/:id/execute` - Execute deletion (admin only)

## Database Schema

**15 Tables:**
1. `users` - User accounts (all roles)
2. `students` - Student extended info
3. `hostel_blocks` - Hostel buildings/sections
4. `rooms` - Individual rooms with capacity
5. `room_allocations` - Student-to-room assignments
6. `guest_visit_requests` - Guest visit approvals
7. `visitor_log` - Guest check-in/check-out tracking
8. `payments` - Payment records
9. `fees` - Hostel fee tracking
10. `complaints` - Maintenance/issue complaints
11. `transfer_requests` - Room change requests
12. `waitlist` - Room availability waitlist
13. `inventory` - Room furniture/equipment
14. `audit_log` - System activity logging
15. `pii_deletion_log` - Data deletion requests

## Key Features

### Security
- JWT token-based authentication (7-day expiry)
- bcryptjs password hashing (10 salt rounds)
- Role-based access control (5 roles: superadmin, warden, accountant, caretaker, student)
- File upload validation (type, size, content)

### Business Logic
- **Capacity checking:** Prevents double-booking of rooms by checking overlapping guest requests
- **Night calculation:** Enforces MAX_OVERNIGHT_NIGHTS (default: 3 nights) for guest stays
- **ID proof requirement:** Overnight guests must provide ID proof
- **Audit logging:** Critical actions logged for compliance
- **PII deletion:** GDPR-compliant data deletion workflow

### File Upload
- Multipart form-data support (multer)
- File type validation: JPEG, PNG, PDF only
- File size limit: 5MB (configurable)
- Automatic cleanup on validation failure

## Environment Variables

```
JWT_SECRET              - JWT signing key (change for production!)
PORT                    - Server port (default: 3000)
NODE_ENV                - Environment (development/production)
DB_PATH                 - SQLite database path (default: ./data/hostel.db)
FILE_SIZE_LIMIT         - Max upload size in bytes (default: 5MB)
ALLOWED_FILE_TYPES      - Comma-separated MIME types
MAX_OVERNIGHT_NIGHTS    - Max consecutive overnight days (default: 3)
```

## Development

### Project Structure
```
backend/
├── server.js                 # Express app & routing
├── package.json             # Dependencies
├── .env                     # Configuration
├── config/
│   ├── database.js          # SQLite schema & queries
│   └── env.js               # Config constants
├── middleware/
│   └── auth.js              # JWT & RBAC middleware
├── routes/
│   ├── auth.js              # Login/register
│   ├── users.js             # User management
│   ├── rooms.js             # Room CRUD
│   ├── blocks.js            # Block CRUD
│   ├── allocations.js       # Room allocation
│   ├── guest-requests.js    # Guest visit workflow
│   ├── visitor-log.js       # Visitor tracking
│   ├── fees.js              # Fee management
│   ├── payments.js          # Payment processing
│   ├── complaints.js        # Complaint tracking
│   ├── transfers.js         # Room transfers
│   ├── waitlist.js          # Waitlist
│   ├── inventory.js         # Inventory
│   ├── audit.js             # Audit logs
│   ├── pii.js               # PII deletion
│   └── uploads.js           # File access control
├── scripts/
│   └── seed.js              # Database seeding
├── uploads/                 # User-uploaded files
└── data/
    └── hostel.db            # SQLite database file
```

### Running Tests
```bash
# Using curl for testing
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hostel.com","password":"admin123"}'
```

## API Response Format

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

## Deployment

### Production Checklist
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific `.env` file
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Configure database backup strategy
- [ ] Set up monitoring/logging
- [ ] Use a process manager (PM2, supervisor)

### Running with PM2
```bash
npm install -g pm2
pm2 start server.js --name "hostel-api"
pm2 save
pm2 startup
```

## Support

For issues or questions, refer to the frontend documentation in `frontend-vanilla/README.md`.
