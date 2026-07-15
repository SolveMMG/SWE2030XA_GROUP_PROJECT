const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const ACCESS_EXPIRY = '1h';
const REFRESH_EXPIRY_DAYS = 30;

function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
}

function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function signRefresh(payload) {
  return jwt.sign({ ...payload, jti: uuidv4() }, process.env.JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_EXPIRY_DAYS}d` });
}

function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_EXPIRY_DAYS);
  return d;
}

module.exports = { signAccess, verifyAccess, signRefresh, verifyRefresh, refreshExpiresAt };
