const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signRefresh, refreshExpiresAt, hashToken } = require('../src/utils/jwt');

let userId, refreshToken;

async function insertToken(token) {
  await pool.query(
    'INSERT INTO auth_tokens (user_id, refresh_token, expires_at) VALUES ($1,$2,$3)',
    [userId, hashToken(token), refreshExpiresAt()]
  );
}

function cookieHeader(token) {
  return [`refreshToken=${token}`];
}

function cookieValue(res) {
  return /refreshToken=([^;]+)/.exec(res.headers['set-cookie'].join(';'))[1];
}

beforeAll(async () => {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, name, email)
     VALUES ('auth_test_g','Auth User','auth_test@test.com')
     ON CONFLICT (email) DO UPDATE SET name='Auth User' RETURNING id`
  );
  userId = rows[0].id;
  refreshToken = signRefresh({ userId });
  await insertToken(refreshToken);
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
});

describe('POST /api/v1/auth/exchange', () => {
  test('rejects a missing code', async () => {
    const res = await request(app).post('/api/v1/auth/exchange').send({});
    expect(res.status).toBe(400);
  });

  test('rejects an unknown code', async () => {
    const res = await request(app).post('/api/v1/auth/exchange').send({ code: 'not-a-real-code' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_CODE');
  });
});

describe('POST /api/v1/auth/refresh', () => {
  test('returns a new access token and rotates the refresh cookie, keeping it out of the body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookieHeader(refreshToken));
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeUndefined();

    const setCookie = res.headers['set-cookie'].join(';');
    expect(setCookie).toContain('HttpOnly');
    const newToken = cookieValue(res);
    expect(newToken).not.toBe(refreshToken);
    refreshToken = newToken;
  });

  test('rejects already-used (rotated) refresh token', async () => {
    const oldToken = refreshToken;
    const rotateRes = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookieHeader(refreshToken));
    refreshToken = cookieValue(rotateRes);

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookieHeader(oldToken));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_REVOKED');
  });

  test('rejects a malformed token string', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookieHeader('not.a.valid.jwt'));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  test('returns 401 when no refresh cookie is present', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('NO_REFRESH_TOKEN');
  });
});

describe('POST /api/v1/auth/logout', () => {
  test('deletes the refresh token and clears the cookie', async () => {
    const freshToken = signRefresh({ userId });
    await insertToken(freshToken);

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookieHeader(freshToken));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const { rows } = await pool.query(
      'SELECT id FROM auth_tokens WHERE refresh_token = $1',
      [hashToken(freshToken)]
    );
    expect(rows.length).toBe(0);
  });

  test('is a no-op when no refresh cookie is present', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
