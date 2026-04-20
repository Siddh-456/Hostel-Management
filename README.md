<div align="center">
  <img src="images/image%20%2817%29.png" alt="Hostel Management System staff dashboard" width="100%" />
  <h1>Hostel Management System</h1>
  <p><strong>Full-stack campus residence operations platform</strong> for room allocation, guest approvals, fees, complaints, transfers, inventory, and compliance workflows.</p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-1c3f5b?style=for-the-badge" alt="Frontend stack" />
    <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-3c7a4a?style=for-the-badge" alt="Backend stack" />
    <img src="https://img.shields.io/badge/Database-PostgreSQL-2c2f44?style=for-the-badge" alt="Database" />
    <img src="https://img.shields.io/badge/Auth-JWT%20%7C%20bcryptjs-bc6a3a?style=for-the-badge" alt="Authentication" />
  </p>
</div>

## What This Project Is

Hostel Management System is a full-stack web application built to streamline day-to-day hostel operations for students and staff. It combines a responsive single-page frontend with a REST API backend and a PostgreSQL database so the same platform can handle accommodation, guest visits, fee tracking, complaints, room transfers, inventory, audit logs, and data privacy workflows.

This project supports multiple roles including students, wardens, accountants, caretakers, and administrators, making it suitable for academic DBMS/full-stack demonstrations as well as small institutional hostel operations.

## At a Glance

<table>
  <tr>
    <td align="center" width="25%">
      <strong>19</strong><br />
      frontend views
    </td>
    <td align="center" width="25%">
      <strong>16</strong><br />
      backend route modules
    </td>
    <td align="center" width="25%">
      <strong>15</strong><br />
      database tables
    </td>
    <td align="center" width="25%">
      <strong>5</strong><br />
      core user roles
    </td>
  </tr>
</table>

## Built With

| Layer | Tools and Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, Vanilla JavaScript, Fetch API, hash-based SPA routing |
| Backend | Node.js, Express.js, CORS, dotenv |
| Database | PostgreSQL, SQL schema files (`tables.sql`, `data.sql`) |
| Security | JWT authentication, bcryptjs password hashing, express-validator |
| File Handling | multer for uploads, MIME/type and size validation |
| Dev Tools | npm, nodemon, `http-server`, Git, GitHub |
| Deployment Support | PM2-ready Node server, static frontend hosting, `backend/vercel.json` |

## Core Modules

- Student dashboard with allocations, guest request status, due fees, and complaint visibility
- Staff dashboard for occupancy, pending requests, complaints, and available room capacity
- Guest visit approval workflow with ID proof upload support
- Rooms and blocks administration for hostel inventory planning
- Fee and payment tracking for hostel finance operations
- Complaint management for maintenance and issue resolution
- Room transfer requests and waitlist handling
- Visitor log, audit trail, and PII deletion workflow

## Project Structure

```text
Hostel-Management/
|-- backend/
|   |-- config/
|   |-- middleware/
|   |-- routes/
|   |-- scripts/
|   |-- utils/
|   |-- server.js
|   |-- package.json
|   `-- vercel.json
|-- frontend-vanilla/
|   |-- assets/
|   |-- css/
|   |-- js/
|   |   |-- components/
|   |   `-- pages/
|   |-- index.html
|   `-- package.json
|-- images/
|-- tables.sql
|-- data.sql
`-- README.md
```

## Interface Gallery

<table>
  <tr>
    <td width="50%" align="center">
      <img src="images/image%20%2811%29.png" alt="Institutional login screen" />
      <br />
      <strong>Login experience</strong><br />
      Role-based entry point for students and staff.
    </td>
    <td width="50%" align="center">
      <img src="images/image%20%2812%29.png" alt="Student dashboard" />
      <br />
      <strong>Student dashboard</strong><br />
      Overview of room allocation, guest approvals, dues, and support status.
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="images/image%20%2813%29.png" alt="Guest visit request form" />
      <br />
      <strong>Guest visit request</strong><br />
      Form workflow with timing, contact details, and ID proof upload.
    </td>
    <td width="50%" align="center">
      <img src="images/image%20%2814%29.png" alt="Transfer request form" />
      <br />
      <strong>Transfer requests</strong><br />
      Students can request room changes with a reason and preferred destination.
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="images/image%20%2815%29.png" alt="Rooms and blocks management" />
      <br />
      <strong>Rooms and blocks</strong><br />
      Warden tools for maintaining room inventory and capacity.
    </td>
    <td width="50%" align="center">
      <img src="images/image%20%2816%29.png" alt="Guest request approval queue" />
      <br />
      <strong>Approval queue</strong><br />
      Staff can approve or reject pending guest visits quickly.
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="images/image%20%2817%29.png" alt="Staff dashboard" />
      <br />
      <strong>Staff dashboard</strong><br />
      Operations snapshot for occupancy, complaints, approvals, and capacity.
    </td>
    <td width="50%" align="center">
      <img src="images/image%20%2818%29.png" alt="Fees and payments screen" />
      <br />
      <strong>Fees and payments</strong><br />
      Finance workspace for unpaid fee items and payment records.
    </td>
  </tr>
</table>

## Local Setup

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL 14 or newer

### 1. Configure PostgreSQL

Create a database and point the backend at it:

```bash
createdb hostel_management
```

Create `backend/.env` from [`backend/.env.example`](backend/.env.example) and set at least:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/hostel_management
JWT_SECRET=replace-this-with-a-secure-secret
```

Use your own PostgreSQL username, password, host, port, and database name if they differ.

### 2. Start the backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

`npm run seed` recreates the demo schema and sample data inside the configured PostgreSQL database.

The API starts on `http://localhost:3000`.

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend-vanilla
npm install
npm run serve
```

Open `http://localhost:5173`.

### 4. Default demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@hostel.com` | `admin123` |
| Warden | `warden@hostel.com` | `warden123` |
| Accountant | `accountant@hostel.com` | `acc123` |
| Caretaker | `caretaker@hostel.com` | `care123` |
| Student | `john@student.com` | `pass123` |

## API and Data Notes

- The frontend automatically uses `http://localhost:3000/api` when running on localhost.
- In deployed environments, the frontend defaults to `${window.location.origin}/api`.
- The backend exposes route groups for auth, users, rooms, blocks, allocations, guest requests, visitor logs, fees, payments, complaints, transfers, waitlist, inventory, audit logs, PII deletion, and uploads.
- The database layer is powered by PostgreSQL and seeded through `backend/scripts/seed.js`.

## Deployment Guide

### A. Push this project to GitHub

If you are publishing this folder to your GitHub repository:

```bash
git init
git branch -M main
git remote add origin https://github.com/Siddh-456/Hostel-Management.git
git add .
git commit -m "Add Hostel Management System project"
git push -u origin main
```

### B. Deploy the backend

The backend is a Node.js + Express application, so it can be deployed on any Node-compatible host such as a VPS, Railway, Render, or a traditional Linux server.

```bash
cd backend
npm install --production
npm run seed
npm start
```

Recommended production environment variables:

```bash
JWT_SECRET=replace-this-with-a-secure-secret
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:5432/hostel_management
PGSSL=true
```

For production, use a managed or persistent PostgreSQL instance such as Neon, Supabase, Railway, Render, AWS RDS, or a self-hosted PostgreSQL server.

### C. Deploy the frontend

The `frontend-vanilla` folder is a static site, so it can be deployed on GitHub Pages, Netlify, Vercel, or Nginx/Apache static hosting.

If the frontend and backend are served from the same domain and the API is available under `/api`, the current configuration works without changes.

If the backend is hosted on a different domain, add this script before `js/config.js` inside `frontend-vanilla/index.html`:

```html
<script>
  window.__HOSTEL_CONFIG__ = {
    API_BASE_URL: 'https://your-backend-domain.com/api'
  };
</script>
```

### D. Production process manager

On a VPS or Linux server, PM2 is a clean way to keep the backend running:

```bash
npm install -g pm2
cd backend
pm2 start server.js --name hostel-api
pm2 save
```

## Why This Project Stands Out

- Clean, framework-free frontend architecture that still feels like a structured SPA
- Real backend workflows instead of static-only UI screens
- Useful DBMS-friendly schema with room allocation, payments, complaints, and compliance logs
- Role-based flows that make the application feel like a complete campus operations product
- Ready-made screenshots and documentation assets for portfolio or academic submission use

## Repository Files Worth Mentioning

- `README.md` - project overview, screenshots, setup, and deployment
- `ARCHITECTURE.md` - deeper system design notes
- `API-CHEATSHEET.md` - endpoint quick reference
- `QUICK-START.md` - quick onboarding notes
- `tables.sql` - PostgreSQL schema definition
- `data.sql` - PostgreSQL sample data

## License

This project is intended for educational and portfolio use unless you define another license for the repository.
