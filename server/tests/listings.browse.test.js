const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signAccess } = require('../src/utils/jwt');

let userId, token, listingIds = [];

beforeAll(async () => {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, name, email)
     VALUES ('browse_g','Browse User','browse@test.com')
     ON CONFLICT (email) DO UPDATE SET name='Browse User' RETURNING id`
  );
  userId = rows[0].id;
  token = signAccess({ userId, email: 'browse@test.com' });

  const seeds = [
    { title: 'React Design System', category: 'design',      price: 1000 },
    { title: 'Node.js API Course',  category: 'programming', price: 2000 },
    { title: 'Essay Writing Help',  category: 'writing',     price: 500  },
  ];
  for (const s of seeds) {
    const { rows: r } = await pool.query(
      `INSERT INTO listings (seller_id, title, description, category, price)
       VALUES ($1,$2,'Desc',$3,$4) RETURNING id`,
      [userId, s.title, s.category, s.price]
    );
    listingIds.push(r[0].id);
  }
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
});

describe('GET /api/v1/listings', () => {
  test('returns listings array with pagination fields', async () => {
    const res = await request(app).get('/api/v1/listings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(typeof res.body.page).toBe('number');
    expect(typeof res.body.totalPages).toBe('number');
    expect(typeof res.body.total).toBe('number');
  });

  test('each listing has seller object embedded', async () => {
    const res = await request(app).get('/api/v1/listings?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.listings.length).toBeGreaterThan(0);
    const listing = res.body.listings[0];
    expect(listing.seller).toBeDefined();
    expect(listing.seller.name).toBeDefined();
    expect(listing.seller.avgRating).toBeDefined();
  });

  test('filters by category', async () => {
    const res = await request(app).get('/api/v1/listings?category=design&limit=100');
    expect(res.status).toBe(200);
    res.body.listings.forEach((l) => expect(l.category).toBe('design'));
  });

  test('filters by sellerId', async () => {
    const res = await request(app).get(`/api/v1/listings?sellerId=${userId}&limit=100`);
    expect(res.status).toBe(200);
    expect(res.body.listings.length).toBe(3);
    res.body.listings.forEach((l) => expect(l.seller_id).toBe(userId));
  });

  test('searches by title keyword (case-insensitive)', async () => {
    const res = await request(app).get('/api/v1/listings?search=node.js&limit=100');
    expect(res.status).toBe(200);
    expect(res.body.listings.some((l) => l.title.toLowerCase().includes('node.js'))).toBe(true);
  });

  test('combines sellerId and category filters', async () => {
    const res = await request(app)
      .get(`/api/v1/listings?sellerId=${userId}&category=programming&limit=100`);
    expect(res.status).toBe(200);
    expect(res.body.listings.length).toBe(1);
    expect(res.body.listings[0].category).toBe('programming');
  });

  test('respects page and limit', async () => {
    const res = await request(app).get('/api/v1/listings?page=1&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.listings.length).toBeLessThanOrEqual(1);
    expect(res.body.page).toBe(1);
  });

  test('ignores invalid category filter', async () => {
    const res = await request(app).get('/api/v1/listings?category=invalid');
    expect(res.status).toBe(200);
  });
});
