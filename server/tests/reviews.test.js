const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signAccess } = require('../src/utils/jwt');

let sellerId, buyerId, buyerToken, listingId, inquiryId;

beforeAll(async () => {
  const { rows: s } = await pool.query(
    `INSERT INTO users (google_id, name, email)
     VALUES ('rev2_seller_g','RevSeller','rev2_seller@test.com')
     ON CONFLICT (email) DO UPDATE SET name='RevSeller' RETURNING id`
  );
  sellerId = s[0].id;

  const { rows: b } = await pool.query(
    `INSERT INTO users (google_id, name, email)
     VALUES ('rev2_buyer_g','RevBuyer','rev2_buyer@test.com')
     ON CONFLICT (email) DO UPDATE SET name='RevBuyer' RETURNING id`
  );
  buyerId = b[0].id;
  buyerToken = signAccess({ userId: buyerId, email: 'rev2_buyer@test.com' });

  const { rows: l } = await pool.query(
    `INSERT INTO listings (seller_id, title, description, category, price)
     VALUES ($1,'Svc','Desc','design',100) RETURNING id`,
    [sellerId]
  );
  listingId = l[0].id;

  const { rows: i } = await pool.query(
    `INSERT INTO inquiries (listing_id, buyer_id, message, status)
     VALUES ($1,$2,'Hi','accepted') RETURNING id`,
    [listingId, buyerId]
  );
  inquiryId = i[0].id;

  await pool.query(
    `INSERT INTO reviews (inquiry_id, reviewer_id, seller_id, rating, comment)
     VALUES ($1,$2,$3,4,'Solid work')`,
    [inquiryId, buyerId, sellerId]
  );
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id IN ($1,$2)', [sellerId, buyerId]);
});

describe('GET /api/v1/reviews', () => {
  test('returns reviews with avgRating and reviewCount', async () => {
    const res = await request(app).get(`/api/v1/reviews?sellerId=${sellerId}`);
    expect(res.status).toBe(200);
    expect(res.body.reviewCount).toBe(1);
    expect(res.body.avgRating).toBe(4);
    expect(res.body.reviews.length).toBe(1);
  });

  test('review includes rating, comment and embedded reviewer', async () => {
    const res = await request(app).get(`/api/v1/reviews?sellerId=${sellerId}`);
    const rev = res.body.reviews[0];
    expect(rev.rating).toBe(4);
    expect(rev.comment).toBe('Solid work');
    expect(rev.reviewer).toBeDefined();
    expect(rev.reviewer.name).toBe('RevBuyer');
  });

  test('returns empty result for seller with no reviews', async () => {
    const res = await request(app).get(`/api/v1/reviews?sellerId=${buyerId}`);
    expect(res.status).toBe(200);
    expect(res.body.reviewCount).toBe(0);
    expect(res.body.avgRating).toBeNull();
    expect(res.body.reviews).toEqual([]);
  });

  test('returns 400 when sellerId is missing', async () => {
    const res = await request(app).get('/api/v1/reviews');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/reviews (validation)', () => {
  test('returns 403 when inquiry is not accepted', async () => {
    const { rows: i2 } = await pool.query(
      `INSERT INTO inquiries (listing_id, buyer_id, message, status)
       VALUES ($1,$2,'Pending inq','pending') RETURNING id`,
      [listingId, buyerId]
    );
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ inquiryId: i2[0].id, rating: 5 });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NOT_ACCEPTED');
    await pool.query('DELETE FROM inquiries WHERE id = $1', [i2[0].id]);
  });

  test('returns 400 when rating is out of range', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ inquiryId, rating: 6 });
    expect(res.status).toBe(400);
  });
});
