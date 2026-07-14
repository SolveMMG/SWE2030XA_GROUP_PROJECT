const express = require('express');
<<<<<<< HEAD
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateMeRules, getUserRules } = require('../middleware/userValidators');
const { getMe, updateMe, getUser, deleteMe } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMeRules, validate, updateMe);
router.delete('/me', auth, deleteMe);
router.get('/:id', getUserRules, validate, getUser);
=======
const { body, param } = require('express-validator');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const pool = require('../db/pool');

const router = express.Router();

const USER_STATS_SQL = `
  SELECT u.*,
    ROUND(AVG(r.rating)::NUMERIC, 1) AS avg_rating,
    COUNT(r.id)::INT AS review_count
  FROM users u
  LEFT JOIN reviews r ON r.seller_id = u.id
  WHERE u.id = $1
  GROUP BY u.id
`;

// GET /api/v1/users/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(USER_STATS_SQL, [req.user.userId]);
    if (!rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    const { google_id, ...user } = rows[0];
    res.json(user);
  } catch (err) { next(err); }
});

// PUT /api/v1/users/me
router.put('/me', requireAuth,
  body('name').optional().notEmpty().withMessage('name cannot be empty'),
  body('bio').optional().isString(),
  body('skills').optional().isArray(),
  body('photoUrl').optional().isURL().withMessage('photoUrl must be a valid URL'),
  validate,
  async (req, res, next) => {
    try {
      const { name, bio, skills, photoUrl } = req.body;
      const { rows } = await pool.query(
        `UPDATE users SET
          name      = COALESCE($1, name),
          bio       = COALESCE($2, bio),
          skills    = COALESCE($3, skills),
          photo_url = COALESCE($4, photo_url),
          updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [name, bio, skills, photoUrl, req.user.userId]
      );
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /api/v1/users/:id
router.get('/:id', param('id').isInt(), validate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(USER_STATS_SQL, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    const { google_id, ...user } = rows[0];
    res.json(user);
  } catch (err) { next(err); }
});

// DELETE /api/v1/users/me
router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.userId]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});
>>>>>>> 2eedb49 (feat: implement authentication and authorization middleware)

module.exports = router;
