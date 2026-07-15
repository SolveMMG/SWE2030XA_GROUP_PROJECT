/**
 * End-to-end integration test covering the full SkillSwap flow:
 *   register users (via direct DB insert, standing in for Google OAuth)
 *   → seller posts a listing
 *   → buyer sends an inquiry
 *   → seller accepts the inquiry
 *   → buyer leaves a review
 *   → review appears in seller's public stats
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signAccess } = require('../src/utils/jwt');

let sellerId, buyerId, sellerToken, buyerToken;
let listingId, inquiryId, reviewId;

// ─── Setup: create two test users ────────────────────────────────────────────
beforeAll(async () => {
  const { rows: s } = await pool.query(
    `INSERT INTO users (google_id, name, email)
     VALUES ('e2e_seller_g', 'E2E Seller', 'e2e_seller@test.com')
     ON CONFLICT (email) DO UPDATE SET name = 'E2E Seller' RETURNING id`
  );
  sellerId    = s[0].id;
  sellerToken = signAccess({ userId: sellerId, email: 'e2e_seller@test.com' });

  const { rows: b } = await pool.query(
    `INSERT INTO users (google_id, name, email)
     VALUES ('e2e_buyer_g', 'E2E Buyer', 'e2e_buyer@test.com')
     ON CONFLICT (email) DO UPDATE SET name = 'E2E Buyer' RETURNING id`
  );
  buyerId    = b[0].id;
  buyerToken = signAccess({ userId: buyerId, email: 'e2e_buyer@test.com' });
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [sellerId, buyerId]);
});

// ─── Step 1: Seller posts a listing ──────────────────────────────────────────
describe('Step 1 — Seller posts a listing', () => {
  test('POST /api/v1/listings returns 201 with the new listing', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title:       'E2E Test Service',
        description: 'An end-to-end test listing',
        category:    'design',
        price:       500,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('E2E Test Service');
    expect(res.body.seller_id).toBe(sellerId);
    listingId = res.body.id;
  });

  test('GET /api/v1/listings includes the new listing', async () => {
    const res = await request(app).get('/api/v1/listings?limit=100');
    expect(res.status).toBe(200);
    const found = res.body.listings.find((l) => l.id === listingId);
    expect(found).toBeDefined();
    expect(found.seller).toBeDefined();
    expect(found.seller.name).toBe('E2E Seller');
  });

  test('GET /api/v1/listings/:id returns full detail with seller', async () => {
    const res = await request(app).get(`/api/v1/listings/${listingId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(listingId);
    expect(res.body.seller.bio).toBeDefined(); // full seller object
  });

  test('GET /api/v1/listings?category=design includes the listing', async () => {
    const res = await request(app).get('/api/v1/listings?category=design&limit=100');
    expect(res.status).toBe(200);
    expect(res.body.listings.some((l) => l.id === listingId)).toBe(true);
  });

  test('GET /api/v1/listings?search=E2E finds the listing', async () => {
    const res = await request(app).get('/api/v1/listings?search=E2E');
    expect(res.status).toBe(200);
    expect(res.body.listings.some((l) => l.id === listingId)).toBe(true);
  });
});

// ─── Step 2: Buyer sends an inquiry ──────────────────────────────────────────
describe('Step 2 — Buyer sends an inquiry', () => {
  test('POST /api/v1/inquiries returns 201 with pending status', async () => {
    const res = await request(app)
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ listingId, message: 'Hi, I am interested!' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.buyer_id).toBe(buyerId);
    inquiryId = res.body.id;
  });

  test('seller cannot inquire on their own listing (400 OWN_LISTING)', async () => {
    const res = await request(app)
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ listingId, message: 'Can I buy my own thing?' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('OWN_LISTING');
  });

  test('GET /api/v1/inquiries?role=sent shows buyer their inquiry', async () => {
    const res = await request(app)
      .get('/api/v1/inquiries?role=sent')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    const found = res.body.find((i) => i.id === inquiryId);
    expect(found).toBeDefined();
    expect(found.listing).toBeDefined();
    expect(found.seller).toBeDefined();
  });

  test('GET /api/v1/inquiries?role=received shows seller their inbox', async () => {
    const res = await request(app)
      .get('/api/v1/inquiries?role=received')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.some((i) => i.id === inquiryId)).toBe(true);
  });
});

// ─── Step 3: Seller accepts the inquiry ──────────────────────────────────────
describe('Step 3 — Seller accepts the inquiry', () => {
  test('buyer cannot accept an inquiry (403 FORBIDDEN)', async () => {
    const res = await request(app)
      .patch(`/api/v1/inquiries/${inquiryId}/accept`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('PATCH /accept returns 200 with status accepted', async () => {
    const res = await request(app)
      .patch(`/api/v1/inquiries/${inquiryId}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
  });

  test('accepting an already-accepted inquiry returns 409 NOT_PENDING', async () => {
    const res = await request(app)
      .patch(`/api/v1/inquiries/${inquiryId}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NOT_PENDING');
  });

  test('declining an already-accepted inquiry also returns 409', async () => {
    const res = await request(app)
      .patch(`/api/v1/inquiries/${inquiryId}/decline`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(409);
  });
});

// ─── Step 4: Buyer leaves a review ───────────────────────────────────────────
describe('Step 4 — Buyer leaves a review', () => {
  test('seller cannot review (403 — only buyer can)', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ inquiryId, rating: 5 });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('POST /api/v1/reviews returns 201 with rating and comment', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ inquiryId, rating: 5, comment: 'Excellent work, very professional!' });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.seller_id).toBe(sellerId);
    reviewId = res.body.id;
  });

  test('duplicate review returns 409 ALREADY_REVIEWED', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ inquiryId, rating: 4 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_REVIEWED');
  });
});

// ─── Step 5: Review appears in seller's public stats ─────────────────────────
describe('Step 5 — Review appears in seller public profile', () => {
  test('GET /api/v1/reviews?sellerId shows the review with reviewer', async () => {
    const res = await request(app).get(`/api/v1/reviews?sellerId=${sellerId}`);
    expect(res.status).toBe(200);
    expect(res.body.reviewCount).toBeGreaterThanOrEqual(1);
    expect(res.body.avgRating).toBeGreaterThanOrEqual(1);
    const rev = res.body.reviews.find((r) => r.id === reviewId);
    expect(rev).toBeDefined();
    expect(rev.comment).toBe('Excellent work, very professional!');
    expect(rev.reviewer.name).toBe('E2E Buyer');
  });

  test('GET /api/v1/users/:id includes avgRating from the review', async () => {
    const res = await request(app).get(`/api/v1/users/${sellerId}`);
    expect(res.status).toBe(200);
    expect(parseFloat(res.body.avg_rating)).toBeGreaterThanOrEqual(1);
    expect(res.body.review_count).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/listings/:id seller object includes avgRating', async () => {
    const res = await request(app).get(`/api/v1/listings/${listingId}`);
    expect(res.status).toBe(200);
    expect(res.body.seller.avgRating).toBeGreaterThanOrEqual(1);
  });
});
