const crypto = require('node:crypto');

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'hirepro-dev-secret';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalKey] = String(storedHash).split(':');
  if (!salt || !originalKey) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalKey, 'hex'), Buffer.from(derivedKey, 'hex'));
}

function sign(value) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(value).digest('base64url');
}

function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    }),
    'utf8'
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (sign(payload) !== signature) {
    return null;
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (decoded.exp < Date.now()) {
    return null;
  }

  return decoded;
}

module.exports = {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
};
