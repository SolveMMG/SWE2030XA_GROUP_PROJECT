const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signRefresh, refreshExpiresAt } = require('../src/utils/jwt');

let userId, refreshToken;

beforeAll(async () => {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, name, email)
     VALUES ('auth_test_g','Auth User','auth_test@test.com')
     ON CONFLICT (email) DO UPDATE SET name='Auth User' RETURNING id`
  );
  userId = rows[0].id;
  refreshToken = signRefresh({ userId });
  await pool.query(
    'INSERT INTO auth_tokens (user_id, refresh_token, expires_at) VALUES ($1,$2,$3)',
    [userId, refreshToken, refreshExpiresAt()]
  );
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
});

describe('POST /api/v1/auth/refresh', () => {
  test('returns new token pair and rotates refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);
    refreshToken = res.body.refreshToken;
  });

  test('rejects already-used (rotated) refresh token', async () => {
    const oldToken = refreshToken;
    await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldToken });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_REVOKED');
  });

  test('rejects a malformed token string', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'not.a.valid.jwt' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('returns 400 when refreshToken is missing', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/logout', () => {
  test('deletes the refresh token and returns ok', async () => {
    const freshToken = signRefresh({ userId });
    await pool.query(
      'INSERT INTO auth_tokens (user_id, refresh_token, expires_at) VALUES ($1,$2,$3)',
      [userId, freshToken, refreshExpiresAt()]
    );

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: freshToken });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const { rows } = await pool.query(
      'SELECT id FROM auth_tokens WHERE refresh_token = $1',
      [freshToken]
    );
    expect(rows.length).toBe(0);
  });

  test('returns 400 when refreshToken is missing', async () => {
    const res = await request(app).post('/api/v1/auth/logout').send({});
    expect(res.status).toBe(400);
  });
});
