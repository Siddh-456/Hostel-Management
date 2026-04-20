# Hostel Management System - Backend API

Express.js + PostgreSQL REST API for hostel management with role-based access control.

## Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+

### Installation

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a PostgreSQL database:
   ```bash
   createdb hostel_management
   ```

3. Create `backend/.env` from [`backend/.env.example`](./.env.example) and configure the connection:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/hostel_management
   JWT_SECRET=replace-with-a-secure-secret
   ```

4. Seed demo data:
   ```bash
   npm run seed
   ```

5. Start the API:
   ```bash
   npm run dev
   ```

The server runs on `http://localhost:3000`.

## Demo Accounts

| Email | Password | Role |
| --- | --- | --- |
| admin@hostel.com | admin123 | superadmin |
| warden@hostel.com | warden123 | warden |
| accountant@hostel.com | acc123 | accountant |
| caretaker@hostel.com | care123 | caretaker |
| john@student.com | pass123 | student |
| jane@student.com | pass123 | student |
| bob@student.com | pass123 | student |

## Environment Variables

```bash
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRE=7d
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/hostel_management
PGSSL=false
FILE_UPLOAD_DIR=uploads
```

You can also use `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` instead of `DATABASE_URL`.

## Notes

- The backend initializes its PostgreSQL schema automatically on startup.
- `npm run seed` drops and recreates the hostel tables in the configured PostgreSQL database before inserting demo records.
- The API exposes auth, users, rooms, blocks, allocations, guest requests, visitor logs, fees, payments, complaints, transfers, waitlist, inventory, audit logs, PII deletion, and uploads routes.
