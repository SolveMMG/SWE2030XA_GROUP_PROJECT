const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerMatch = authHeader && authHeader.match(/^Bearer\s+([^\s]+)$/);
  if (!bearerMatch) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' } });
  }

  try {
    const payload = jwt.verify(bearerMatch[1], process.env.JWT_SECRET);
    const userId = payload.userId || payload.id;
    if (!userId) throw new Error('Token is missing a user identifier');

    req.user = {
      id: userId,
      userId,
      email: payload.email,
    };
    return next();
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
};

module.exports = auth;
