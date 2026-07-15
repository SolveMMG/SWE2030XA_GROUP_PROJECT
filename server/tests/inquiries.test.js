const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signAccess } = require('../src/utils/jwt');

let sellerId, buyerId, sellerToken, buyerToken, listingId, inquiryId;

beforeAll(async () => {
  const { rows: s } = await pool.query(
    `INSERT INTO users (google_id, name, email) VALUES ('inq_seller_g','Seller','inq_seller@test.com')
     ON CONFLICT (email) DO UPDATE SET name='Seller' RETURNING id`
  );
  sellerId = s[0].id;
  sellerToken = signAccess({ userId: sellerId, email: 'inq_seller@test.com' });

  const { rows: b } = await pool.query(
    `INSERT INTO users (google_id, name, email) VALUES ('inq_buyer_g','Buyer','inq_buyer@test.com')
     ON CONFLICT (email) DO UPDATE SET name='Buyer' RETURNING id`
  );
  buyerId = b[0].id;
  buyerToken = signAccess({ userId: buyerId, email: 'inq_buyer@test.com' });

  const { rows: l } = await pool.query(
    `INSERT INTO listings (seller_id, title, description, category, price) VALUES ($1,'Svc','Desc','design',100) RETURNING id`,
    [sellerId]
  );
  listingId = l[0].id;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id IN ($1,$2)', [sellerId, buyerId]);
});

describe('Inquiry flow', () => {
  test('buyer cannot inquire on own listing', async () => {
    const res = await request(app).post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ listingId, message: 'test' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('OWN_LISTING');
  });

  test('buyer creates inquiry', async () => {
    const res = await request(app).post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ listingId, message: 'Interested!' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    inquiryId = res.body.id;
  });

  test('seller accepts inquiry', async () => {
    const res = await request(app).patch(`/api/v1/inquiries/${inquiryId}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
  });

  test('cannot accept already-accepted inquiry', async () => {
    const res = await request(app).patch(`/api/v1/inquiries/${inquiryId}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(409);
  });
});

describe('Review eligibility', () => {
  test('buyer can review accepted inquiry', async () => {
    const res = await request(app).post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ inquiryId, rating: 5, comment: 'Great!' });
    expect(res.status).toBe(201);
  });

  test('cannot review same inquiry twice', async () => {
    const res = await request(app).post('/api/v1/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ inquiryId, rating: 4 });
    expect(res.status).toBe(409);
  });

  test('seller cannot review (only buyer can)', async () => {
    const res = await request(app).post('/api/v1/reviews')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ inquiryId, rating: 5 });
    expect(res.status).toBe(403);
  });
});
