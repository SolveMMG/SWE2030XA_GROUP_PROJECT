const express = require('express');
const { body, param, query } = require('express-validator');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const pool = require('../db/pool');

const router = express.Router();

const CATEGORIES = ['design','programming','writing','tutoring','music','photography','other'];

// GET /api/v1/listings
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  async (req, res, next) => {
    try {
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const { search, category } = req.query;

      const conditions = [];
      const params = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`);
      }
      if (category && CATEGORIES.includes(category)) {
        params.push(category);
        conditions.push(`l.category = $${params.length}`);
      }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      const countRes = await pool.query(
        `SELECT COUNT(*) FROM listings l ${where}`,
        params
      );
      const total = parseInt(countRes.rows[0].count);

      params.push(limit, offset);
      const { rows } = await pool.query(
        `SELECT l.*,
           json_build_object('id', u.id, 'name', u.name,
             'avgRating', ROUND(AVG(r.rating)::NUMERIC, 1),
             'reviewCount', COUNT(r.id)::INT) AS seller
         FROM listings l
         JOIN users u ON u.id = l.seller_id
         LEFT JOIN reviews r ON r.seller_id = u.id
         ${where}
         GROUP BY l.id, u.id
         ORDER BY l.created_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );

      res.json({ listings: rows, page, totalPages: Math.ceil(total / limit), total });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/listings
router.post('/', requireAuth,
  body('title').notEmpty().withMessage('title required'),
  body('description').notEmpty().withMessage('description required'),
  body('category').isIn(CATEGORIES).withMessage('invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('price must be >= 0'),
  body('imageUrl').optional().isURL(),
  validate,
  async (req, res, next) => {
    try {
      const { title, description, category, price, imageUrl } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO listings (seller_id, title, description, category, price, image_url)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [req.user.userId, title, description, category, price, imageUrl || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /api/v1/listings/:id
router.get('/:id', param('id').isInt(), validate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*,
         json_build_object('id', u.id, 'name', u.name, 'email', u.email,
           'photoUrl', u.photo_url, 'bio', u.bio,
           'avgRating', ROUND(AVG(r.rating)::NUMERIC, 1),
           'reviewCount', COUNT(r.id)::INT) AS seller
       FROM listings l
       JOIN users u ON u.id = l.seller_id
       LEFT JOIN reviews r ON r.seller_id = u.id
       WHERE l.id = $1
       GROUP BY l.id, u.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Listing not found' } });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/v1/listings/:id
router.put('/:id', requireAuth, param('id').isInt(),
  body('title').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('category').optional().isIn(CATEGORIES),
  body('price').optional().isFloat({ min: 0 }),
  body('imageUrl').optional().isURL(),
  validate,
  async (req, res, next) => {
    try {
      const { rows: existing } = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
      if (!existing.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Listing not found' } });
      if (existing[0].seller_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your listing' } });

      const { title, description, category, price, imageUrl } = req.body;
      const { rows } = await pool.query(
        `UPDATE listings SET
           title       = COALESCE($1, title),
           description = COALESCE($2, description),
           category    = COALESCE($3, category),
           price       = COALESCE($4, price),
           image_url   = COALESCE($5, image_url),
           updated_at  = NOW()
         WHERE id = $6 RETURNING *`,
        [title, description, category, price, imageUrl, req.params.id]
      );
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/listings/:id
router.delete('/:id', requireAuth, param('id').isInt(), validate, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Listing not found' } });
    if (rows[0].seller_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your listing' } });
    await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
