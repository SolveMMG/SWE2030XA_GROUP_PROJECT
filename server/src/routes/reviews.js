const express = require('express');
const { body, query } = require('express-validator');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const pool = require('../db/pool');

const router = express.Router();

// POST /api/v1/reviews
router.post('/', requireAuth,
  body('inquiryId').isInt().withMessage('inquiryId required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be 1-5'),
  body('comment').optional().isString(),
  validate,
  async (req, res, next) => {
    try {
      const { inquiryId, rating, comment } = req.body;

      const { rows } = await pool.query(
        `SELECT i.*, l.seller_id FROM inquiries i JOIN listings l ON l.id = i.listing_id WHERE i.id = $1`,
        [inquiryId]
      );
      if (!rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Inquiry not found' } });

      const inquiry = rows[0];
      if (inquiry.buyer_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only the buyer can leave a review' } });
      if (inquiry.status !== 'accepted') return res.status(403).json({ error: { code: 'NOT_ACCEPTED', message: 'Inquiry must be accepted before reviewing' } });

      const { rows: existing } = await pool.query('SELECT id FROM reviews WHERE inquiry_id = $1', [inquiryId]);
      if (existing.length) return res.status(409).json({ error: { code: 'ALREADY_REVIEWED', message: 'This inquiry already has a review' } });

      const { rows: created } = await pool.query(
        'INSERT INTO reviews (inquiry_id, reviewer_id, seller_id, rating, comment) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [inquiryId, req.user.userId, inquiry.seller_id, rating, comment || null]
      );

      res.status(201).json(created[0]);
    } catch (err) { next(err); }
  }
);

// GET /api/v1/reviews?sellerId=
router.get('/',
  query('sellerId').isInt().withMessage('sellerId required'),
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT r.*,
           json_build_object('id', u.id, 'name', u.name, 'photoUrl', u.photo_url) AS reviewer
         FROM reviews r
         JOIN users u ON u.id = r.reviewer_id
         WHERE r.seller_id = $1
         ORDER BY r.created_at DESC`,
        [req.query.sellerId]
      );

      const avgRating = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : null;

      res.json({ avgRating: avgRating ? parseFloat(avgRating) : null, reviewCount: rows.length, reviews: rows });
    } catch (err) { next(err); }
  }
);

module.exports = router;
