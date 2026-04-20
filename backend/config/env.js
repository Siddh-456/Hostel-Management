require('dotenv').config();
const path = require('path');

const resolveProjectPath = (targetPath) => (
  path.isAbsolute(targetPath)
    ? targetPath
    : path.resolve(__dirname, '..', targetPath)
);

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const getSslConfig = () => {
  const sslFlag = (process.env.PGSSL || '').toLowerCase();

  if (sslFlag === 'true' || sslFlag === 'require') {
    return { rejectUnauthorized: false };
  }

  if (sslFlag === 'false') {
    return false;
  }

  return process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false;
};

const getPostgresConfig = () => {
  const baseConfig = {
    max: parseInteger(process.env.PGPOOL_MAX, 10),
    idleTimeoutMillis: parseInteger(process.env.PG_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMillis: parseInteger(process.env.PG_CONNECTION_TIMEOUT_MS, 10000),
    ssl: getSslConfig()
  };

  if (process.env.DATABASE_URL) {
    return {
      ...baseConfig,
      connectionString: process.env.DATABASE_URL
    };
  }

  return {
    ...baseConfig,
    host: process.env.PGHOST || '127.0.0.1',
    port: parseInteger(process.env.PGPORT, 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'hostel_management'
  };
};

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'hostel-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  POSTGRES_CONFIG: getPostgresConfig(),
  FILE_UPLOAD_DIR: resolveProjectPath(process.env.FILE_UPLOAD_DIR || 'uploads'),
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_OVERNIGHT_NIGHTS: 3,
  PAGINATION_LIMIT: 20
};
