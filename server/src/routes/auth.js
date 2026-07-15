const express = require('express');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const pool = require('../db/pool');
const { signAccess, signRefresh, verifyRefresh, refreshExpiresAt } = require('../utils/jwt');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
router.use(authLimiter);

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
        [user.id, refreshToken, refreshExpiresAt()]
      );

      const params = new URLSearchParams({
        token,
        refreshToken,
        userId: user.id,
        name: user.name,
        email: user.email,
        photoUrl: user.photo_url || '',
        isNewUser: user.is_new_user ? '1' : '0',
      });

      res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params}`);
    } catch {
      res.redirect(`${process.env.CLIENT_URL}/login?error=server`);
    }
  }
);

// POST /api/v1/auth/refresh
router.post('/refresh',
  body('refreshToken').notEmpty().withMessage('refreshToken required'),
  validate,
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      let payload;
      try {
        payload = verifyRefresh(refreshToken);
      } catch {
        return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Refresh token invalid or expired' } });
      }

      const { rows } = await pool.query(
        'SELECT * FROM auth_tokens WHERE refresh_token = $1 AND expires_at > NOW()',
        [refreshToken]
      );
      if (!rows.length) {
        return res.status(401).json({ error: { code: 'TOKEN_REVOKED', message: 'Refresh token not found or expired' } });
      }

      // Rotate
      await pool.query('DELETE FROM auth_tokens WHERE id = $1', [rows[0].id]);

      const { rows: userRows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
      if (!userRows.length) {
        return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      }
      const user = userRows[0];

      const newToken = signAccess({ userId: user.id, email: user.email });
      const newRefresh = signRefresh({ userId: user.id });

      await pool.query(
        'INSERT INTO auth_tokens (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)',
        [user.id, newRefresh, refreshExpiresAt()]
      );

      res.json({ token: newToken, refreshToken: newRefresh });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/logout
router.post('/logout',
  body('refreshToken').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      await pool.query('DELETE FROM auth_tokens WHERE refresh_token = $1', [req.body.refreshToken]);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
