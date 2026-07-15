const { verifyAccess } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  }
  try {
    req.user = verifyAccess(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token invalid or expired' } });
  }
}

module.exports = requireAuth;
