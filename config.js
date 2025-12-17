
// All configuration should come from environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const BASE_URL   = process.env.BASE_URL   || "http://localhost:5173";

module.exports = {
  MONGODB_URI,
  JWT_SECRET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  BASE_URL,
};
