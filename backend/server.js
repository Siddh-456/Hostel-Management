require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
db.initialize();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/blocks', require('./routes/blocks'));
app.use('/api/allocations', require('./routes/allocations'));
app.use('/api/guest-requests', require('./routes/guest-requests'));
app.use('/api/visitor-log', require('./routes/visitor-log'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/transfer-requests', require('./routes/transfers'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/audit-log', require('./routes/audit'));
app.use('/api/pii-deletion-log', require('./routes/pii'));
app.use('/api/uploads', require('./routes/uploads'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
// Crash handlers for visibility
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

// For local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    const addr = server.address();
    const host = addr && addr.address ? addr.address : '0.0.0.0';
    const port = addr && addr.port ? addr.port : PORT;
    console.log(`Backend running on http://${host}:${port}`);
    console.log(`Process PID: ${process.pid}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

// Export for Vercel serverless
module.exports = app;

// Export for Vercel serverless
module.exports = app;
