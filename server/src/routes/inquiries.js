const express = require('express');
const { body, param, query } = require('express-validator');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const pool = require('../db/pool');
const { sendInquiryNotification, sendInquiryStatusUpdate } = require('../services/email');

const router = express.Router();

// POST /api/v1/inquiries
router.post('/', requireAuth,
  body('listingId').isInt().withMessage('listingId required'),
  body('message').notEmpty().withMessage('message required'),
  validate,
  async (req, res, next) => {
    try {
      const { listingId, message } = req.body;
      const { rows: listingRows } = await pool.query(
        'SELECT l.*, u.name AS seller_name, u.email AS seller_email FROM listings l JOIN users u ON u.id = l.seller_id WHERE l.id = $1',
        [listingId]
      );
      if (!listingRows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Listing not found' } });

      const listing = listingRows[0];
      if (listing.seller_id === req.user.userId) {
        return res.status(400).json({ error: { code: 'OWN_LISTING', message: 'Cannot inquire on your own listing' } });
      }

      const { rows: buyerRows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
      const buyer = buyerRows[0];

      const { rows } = await pool.query(
        'INSERT INTO inquiries (listing_id, buyer_id, message) VALUES ($1,$2,$3) RETURNING *',
        [listingId, req.user.userId, message]
      );

      sendInquiryNotification({
        sellerEmail: listing.seller_email,
        sellerName: listing.seller_name,
        buyerName: buyer.name,
        listingTitle: listing.title,
        message,
        clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      }).catch(console.error);

      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /api/v1/inquiries
router.get('/', requireAuth,
  query('role').optional().isIn(['sent','received']),
  query('status').optional().isIn(['pending','accepted','declined']),
  validate,
  async (req, res, next) => {
    try {
      const { role, status } = req.query;
      const conditions = [];
      const params = [];

      if (role === 'sent') {
        params.push(req.user.userId);
        conditions.push(`i.buyer_id = $${params.length}`);
      } else if (role === 'received') {
        params.push(req.user.userId);
        conditions.push(`l.seller_id = $${params.length}`);
      } else {
        params.push(req.user.userId);
        conditions.push(`(i.buyer_id = $${params.length} OR l.seller_id = $${params.length})`);
      }

      if (status) {
        params.push(status);
        conditions.push(`i.status = $${params.length}`);
      }

      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

      const { rows } = await pool.query(
        `SELECT i.*,
           json_build_object('id', l.id, 'title', l.title, 'sellerId', l.seller_id) AS listing,
           json_build_object('id', b.id, 'name', b.name, 'photoUrl', b.photo_url) AS buyer,
           json_build_object('id', s.id, 'name', s.name, 'photoUrl', s.photo_url) AS seller,
           (SELECT COUNT(*) FROM reviews rv WHERE rv.inquiry_id = i.id)::INT AS review_count
         FROM inquiries i
         JOIN listings l ON l.id = i.listing_id
         JOIN users b ON b.id = i.buyer_id
         JOIN users s ON s.id = l.seller_id
         ${where}
         ORDER BY i.created_at DESC`,
        params
      );

      res.json(rows);
    } catch (err) { next(err); }
  }
);

async function updateInquiryStatus(req, res, next, newStatus) {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, l.seller_id, l.title AS listing_title,
         b.email AS buyer_email, b.name AS buyer_name
       FROM inquiries i
       JOIN listings l ON l.id = i.listing_id
       JOIN users b ON b.id = i.buyer_id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Inquiry not found' } });

    const inquiry = rows[0];
    if (inquiry.seller_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your inquiry to manage' } });
    if (inquiry.status !== 'pending') return res.status(409).json({ error: { code: 'NOT_PENDING', message: 'Inquiry is not pending' } });

    const { rows: updated } = await pool.query(
      'UPDATE inquiries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newStatus, req.params.id]
    );

    sendInquiryStatusUpdate({
      buyerEmail: inquiry.buyer_email,
      buyerName: inquiry.buyer_name,
      listingTitle: inquiry.listing_title,
      status: newStatus,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    }).catch(console.error);

    res.json(updated[0]);
  } catch (err) { next(err); }
}

// PATCH /api/v1/inquiries/:id/accept
router.patch('/:id/accept', requireAuth, param('id').isInt(), validate,
  (req, res, next) => updateInquiryStatus(req, res, next, 'accepted')
);

// PATCH /api/v1/inquiries/:id/decline
router.patch('/:id/decline', requireAuth, param('id').isInt(), validate,
  (req, res, next) => updateInquiryStatus(req, res, next, 'declined')
);

module.exports = router;
