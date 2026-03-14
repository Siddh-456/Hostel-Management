# Hostel Management System - Vanilla Frontend

A complete, responsive single-page application built with vanilla HTML, CSS, and JavaScript. **No frameworks or build tools required** — just open `index.html` in a browser.

## Features

✅ **Complete Implementation**
- Student Dashboard with allocations, guest requests, and fees
- Request Guest Visit with file upload & validation
- Visitor Log & Complaint System
- Payment Simulation
- Transfer Requests & Waitlist Management
- Staff Dashboard with statistics
- Guest Request Queue & Approval Workflow
- Guest Room Calendar
- Check-in/Check-out Kiosk
- Rooms & Blocks CRUD Management
- Fees & Payments Tracking
- Complaints Board
- Inventory Management
- Audit Log & PII Deletion UI
- Role-based Access Control (Student/Staff/Admin)
- Responsive Mobile-Friendly Design
- Toast Notifications & Modal Confirmations

## Quick Start

### Option 1: Using Mock Server (Recommended for Full Testing)

**Prerequisites:** Node.js 14+

1. **Install dependencies:**
```powershell
cd 'c:\Users\ishan maurya\OneDrive\Desktop\22\dbms-project\frontend-vanilla'
npm install
```

2. **Start mock API server** (Terminal 1):
```powershell
npm run mock
```
API will run on `http://localhost:4000`

3. **Serve frontend** (Terminal 2):
```powershell
npm run serve
```
Frontend will run on `http://localhost:5173`

4. **Open in browser:**
Navigate to `http://localhost:5173`

### Option 2: Direct File Opening (No Server)

1. Simply open `index.html` directly in your browser
2. **Note:** File upload and some API features won't work (CORS/security restrictions)

## Demo Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Warden | warden@college.edu | any | warden |
| Accountant | accountant@college.edu | any | accountant |
| Caretaker | caretaker@college.edu | any | caretaker |
| Student 1 | s101@students.edu | any | student |
| Student 2 | s102@students.edu | any | student |

*Password field accepts any input for demo purposes*

## Project Structure

```
frontend-vanilla/
├── index.html                 # Main HTML entry point
├── css/
│   └── styles.css            # All styling (responsive, modern UI)
├── js/
│   ├── config.js             # Configuration & constants
│   ├── api.js                # API client (all endpoints)
│   ├── auth.js               # Authentication & session management
│   ├── router.js             # SPA router & base Page class
│   ├── app.js                # Application initialization
│   ├── components/
│   │   └── layout.js         # Layout with sidebar & topbar
│   └── pages/
│       ├── login.js          # Login page
│       ├── student-dashboard.js
│       ├── guest-request.js
│       ├── visitor-log.js
│       ├── pay-fees.js
│       ├── raise-complaint.js
│       ├── transfer-request.js
│       ├── my-allocations.js
│       ├── staff-dashboard.js
│       ├── guest-queue.js
│       ├── guest-calendar.js
│       ├── kiosk.js
│       ├── rooms-management.js
│       ├── fees-payments.js
│       ├── complaints-board.js
│       ├── transfers-waitlist.js
│       ├── inventory.js
│       └── audit-pii.js
├── mock/
│   ├── server.js             # Express mock API server
│   ├── db.json               # Seed data (all tables)
│   └── package.json
└── README.md
```

## Architecture

### Frontend (Vanilla JS)
- **No dependencies** — pure HTML, CSS, JavaScript
- **Router:** Simple hash-based routing (no framework)
- **API Client:** Fetch-based with automatic token injection
- **Auth:** LocalStorage-based session management
- **State:** Component-scoped with modal/notification system
- **Styling:** Mobile-first responsive design with CSS Grid/Flexbox

### Mock API Server
- **Express.js** backend simulating all required endpoints
- **In-memory JSON database** (mock/db.json)
- **Mock authentication** with token validation
- **CRUD operations** for all entities
- **Automatic data persistence** to db.json

## Key Features

### Client-Side Validation
- Check-in < Check-out validation
- Maximum overnight nights enforcement (configurable)
- File type & size validation for ID proof
- Night calculation (ceil of hours/24)

### Role-Based Access
- Students: Dashboard, Guest requests, Complaints, Payments, etc.
- Staff (Warden/Caretaker): Guest queue, Calendar, Check-in kiosk, Management
- Admin features: User management, Audit logs, PII deletion

### Responsive UI
- Sidebar navigation (collapsible on mobile)
- Topbar with user info & logout
- Tables with proper scrolling
- Mobile-optimized forms and buttons
- Toast notifications (bottom-right)
- Modal dialogs for confirmations

### API Integration
- All endpoints match spec exactly
- Bearer token authentication
- Automatic error handling & user feedback
- Form data support for file uploads
- Response wrapping: `{ success: true, data: ... }`

## Configuration

Edit `js/config.js` to customize:
```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:4000/api',  // Change if API on different port
  MAX_OVERNIGHT_NIGHTS: 3,                     // Max nights for guest stays
  FILE_SIZE_LIMIT: 5 * 1024 * 1024,           // 5MB file upload limit
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  TOKEN_KEY: 'hostel_token',
  USER_KEY: 'hostel_user'
};
```

## Running Tests (Manual Acceptance Criteria)

### Critical User Flows

**Student: Request overnight guest with ID proof**
1. Login as s101@students.edu
2. Click "Request Guest Visit"
3. Fill form: Guest name, check-in, check-out (2+ days), upload ID proof
4. Submit → Success notification
5. Verify in Staff Dashboard → Guest Queue

**Staff: Approve and assign guest room**
1. Login as warden@college.edu
2. Go to Guest Queue → See pending request
3. Click "Approve" → Select guest room G-01
4. Check Guest Calendar → Booking appears

**Overbooking Prevention**
1. Try to approve multiple overlapping requests for same room
2. Backend returns 409 (handled gracefully in UI)

**Payment Simulation**
1. Login as student
2. Go to Pay Fees → Click "Pay Now" on unpaid fee
3. Select payment method
4. Confirm → Payment success notification

**Complaint Lifecycle**
1. Raise Complaint (Category, Description)
2. (Staff) Update status: Open → In Progress → Resolved
3. Verify in Complaints Board

## Environment Setup

For production deployment, update:

```javascript
// js/config.js
const CONFIG = {
  API_BASE_URL: 'https://your-api.com/api',  // Production API URL
  // ... rest of config
};
```

## Deployment

### Netlify/Vercel
```bash
# Deploy just the frontend folder
# Point to frontend-vanilla/ as root
```

### Traditional Server
```bash
# Copy frontend-vanilla/ to web root
# Ensure API_BASE_URL points to backend
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["npm", "run", "serve"]
```

## API Endpoints Implemented

### Auth
- `POST /api/auth/login` — Login with email/password
- `GET /api/auth/me` — Get current user

### Rooms & Blocks
- `GET /api/rooms` — List all rooms
- `POST /api/rooms` — Create room
- `PUT /api/rooms/:id` — Update room
- `GET /api/blocks` — List blocks
- `POST /api/blocks` — Create block

### Guest Requests
- `GET /api/guest-requests` — List requests (filter by status, host_student_id)
- `POST /api/guest-requests` — Create request (multipart)
- `POST /api/guest-requests/:id/approve` — Approve & assign room
- `POST /api/guest-requests/:id/reject` — Reject request
- `POST /api/guest-requests/:id/checkin` — Check-in guest
- `POST /api/guest-requests/:id/checkout` — Check-out guest

### Fees & Payments
- `GET /api/fees` — List fees
- `POST /api/payments` — Create payment
- `GET /api/payments` — List payments
- `POST /api/fees/:id/mark-paid` — Mark fee as paid

### Complaints, Transfers, Inventory, Audit/PII, Visitor Log
- Full CRUD operations for all entities

## Security Notes

- **Token Storage:** Uses localStorage (httpOnly cookie recommended for production)
- **ID Proof Files:** Stored on server; frontend sends Bearer token for access
- **PII Deletion:** UI triggers backend job; data permanently deleted after retention period
- **CORS:** Configured in mock server; ensure same-origin or explicit CORS policy in production

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

**"API not accessible"**
- Ensure mock server is running on port 4000
- Check `CONFIG.API_BASE_URL` in `js/config.js`

**"Unauthorized" errors**
- Ensure token is stored in localStorage after login
- Check browser DevTools → Application → LocalStorage

**CORS errors**
- Mock server has CORS enabled; for production, configure backend CORS headers

**File upload not working**
- Open file console for errors
- Ensure API accepts multipart/form-data

## Next Steps for Production

1. **Connect real backend** — Update `API_BASE_URL` in config
2. **Add E2E tests** — Use Cypress for critical flows
3. **Implement real calendar** — Add FullCalendar.io for better scheduling
4. **Add search/filtering** — Enhance table views with pagination
5. **Implement reports** — Add charts for occupancy, fees, etc.
6. **Set up CI/CD** — GitHub Actions for deployment

## Support

For issues or questions, refer to the inline code comments or check the mock API logs.

---

**Built with ❤️ using vanilla web technologies**
