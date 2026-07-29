const express = require('express');
const crypto = require('crypto');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const pool = require('../db/pool');
const {
  signAccess, signRefresh, verifyRefresh, refreshExpiresAt, hashToken, REFRESH_EXPIRY_DAYS,
} = require('../utils/jwt');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
router.use(authLimiter);

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  // Client and server are on different Render subdomains in production, making
  // requests between them cross-site — SameSite=None (+Secure) is required for
  // the cookie to be sent. Locally, client/server share the "localhost" site
  // (ports don't affect SameSite), so Lax is fine and avoids needing HTTPS.
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? 'none' : 'lax',
  path: REFRESH_COOKIE_PATH,
};

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
}

// One-time codes bridge the OAuth redirect to the SPA without putting tokens in the URL.
const CODE_TTL_MS = 60 * 1000;
const pendingAuth = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of pendingAuth) {
    if (entry.expiresAt < now) pendingAuth.delete(code);
  }
}, 5 * 60 * 1000).unref();

// GET /api/v1/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// GET /api/v1/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = signAccess({ userId: user.id, email: user.email });
      const refreshToken = signRefresh({ userId: user.id });

      await pool.query(
        'INSERT INTO auth_tokens (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)',
        [user.id, hashToken(refreshToken), refreshExpiresAt()]
      );

      const code = crypto.randomBytes(24).toString('hex');
      pendingAuth.set(code, {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.photo_url || null,
          isNewUser: !!user.is_new_user,
        },
        expiresAt: Date.now() + CODE_TTL_MS,
      });

      res.redirect(`${process.env.CLIENT_URL}/auth/callback?code=${code}`);
    } catch {
      res.redirect(`${process.env.CLIENT_URL}/login?error=server`);
    }
  }
);

// POST /api/v1/auth/exchange
router.post('/exchange',
  body('code').notEmpty().withMessage('code required'),
  validate,
  (req, res) => {
    const entry = pendingAuth.get(req.body.code);
    if (!entry) {
      return res.status(400).json({ error: { code: 'INVALID_CODE', message: 'Code invalid, expired, or already used' } });
    }
    pendingAuth.delete(req.body.code);
    if (entry.expiresAt < Date.now()) {
      return res.status(400).json({ error: { code: 'INVALID_CODE', message: 'Code invalid, expired, or already used' } });
    }

    setRefreshCookie(res, entry.refreshToken);
    res.json({ token: entry.token, user: entry.user });
  }
);

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token cookie present' } });
    }

    try {
      verifyRefresh(refreshToken);
    } catch {
      clearRefreshCookie(res);
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Refresh token invalid or expired' } });
    }

    const tokenHash = hashToken(refreshToken);
    const { rows } = await pool.query(
      'SELECT * FROM auth_tokens WHERE refresh_token = $1 AND expires_at > NOW()',
      [tokenHash]
    );
    if (!rows.length) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: { code: 'TOKEN_REVOKED', message: 'Refresh token not found or expired' } });
    }

    // Rotate
    await pool.query('DELETE FROM auth_tokens WHERE id = $1', [rows[0].id]);

    const { rows: userRows } = await pool.query('SELECT * FROM users WHERE id = $1', [rows[0].user_id]);
    if (!userRows.length) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }
    const user = userRows[0];

    const newToken = signAccess({ userId: user.id, email: user.email });
    const newRefresh = signRefresh({ userId: user.id });

    await pool.query(
      'INSERT INTO auth_tokens (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashToken(newRefresh), refreshExpiresAt()]
    );

    setRefreshCookie(res, newRefresh);
    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (refreshToken) {
      await pool.query('DELETE FROM auth_tokens WHERE refresh_token = $1', [hashToken(refreshToken)]);
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
