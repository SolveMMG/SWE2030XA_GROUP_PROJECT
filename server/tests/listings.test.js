const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signAccess } = require('../src/utils/jwt');

let userId, token, listingId;

beforeAll(async () => {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, name, email) VALUES ('test_list_g','Test User','testlist@test.com')
     ON CONFLICT (email) DO UPDATE SET name='Test User' RETURNING id`
  );
  userId = rows[0].id;
  token = signAccess({ userId, email: 'testlist@test.com' });
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
});

describe('Listings CRUD', () => {
  test('creates a listing', async () => {
    const res = await request(app).post('/api/v1/listings')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Listing', description: 'Desc', category: 'design', price: 500 });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Listing');
    listingId = res.body.id;
  });

  test('gets listing by id', async () => {
    const res = await request(app).get(`/api/v1/listings/${listingId}`);
    expect(res.status).toBe(200);
    expect(res.body.seller).toBeDefined();
  });

  test('updates own listing', async () => {
    const res = await request(app).put(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  test('forbids update by non-owner', async () => {
    const { rows } = await pool.query(
      `INSERT INTO users (google_id, name, email) VALUES ('other_g','Other','other@test.com')
       ON CONFLICT (email) DO UPDATE SET name='Other' RETURNING id`
    );
    const otherToken = signAccess({ userId: rows[0].id, email: 'other@test.com' });
    const res = await request(app).put(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked' });
    expect(res.status).toBe(403);
    await pool.query('DELETE FROM users WHERE id = $1', [rows[0].id]);
  });

  test('deletes own listing', async () => {
    const res = await request(app).delete(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('returns 404 for deleted listing', async () => {
    const res = await request(app).get(`/api/v1/listings/${listingId}`);
    expect(res.status).toBe(404);
  });
});
