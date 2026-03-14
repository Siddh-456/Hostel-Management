require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'hostel-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: process.env.DB_PATH || './data/hostel.db',
  FILE_UPLOAD_DIR: process.env.FILE_UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_OVERNIGHT_NIGHTS: 3,
  PAGINATION_LIMIT: 20
};
