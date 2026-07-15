const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/pool');
const { signAccess } = require('../src/utils/jwt');

let userId, token;

beforeAll(async () => {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, name, email, bio, skills)
     VALUES ('usr_test_g','Test User','usr_test@test.com','A bio',ARRAY['design','writing'])
     ON CONFLICT (email) DO UPDATE SET name='Test User', bio='A bio', skills=ARRAY['design','writing']
     RETURNING id`
  );
  userId = rows[0].id;
  token = signAccess({ userId, email: 'usr_test@test.com' });
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
});

describe('GET /api/v1/users/me', () => {
  test('returns own profile with stats', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
    expect(res.body.email).toBe('usr_test@test.com');
    expect(res.body.avg_rating).toBeDefined();
    expect(res.body.review_count).toBeDefined();
  });

  test('strips google_id from response', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.google_id).toBeUndefined();
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/v1/users/me', () => {
  test('updates name and bio', async () => {
    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', bio: 'New bio' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.bio).toBe('New bio');
  });

  test('updates skills array', async () => {
    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ skills: ['design', 'programming'] });
    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual(expect.arrayContaining(['design', 'programming']));
  });

  test('COALESCE preserves existing fields when not supplied', async () => {
    await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice' });

    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Only updating bio' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alice');
    expect(res.body.bio).toBe('Only updating bio');
  });

  test('returns 401 without token', async () => {
    const res = await request(app).put('/api/v1/users/me').send({ name: 'x' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/users/:id', () => {
  test('returns public profile', async () => {
    const res = await request(app).get(`/api/v1/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
    expect(res.body.google_id).toBeUndefined();
    expect(res.body.avg_rating).toBeDefined();
  });

  test('returns 404 for non-existent user', async () => {
    const res = await request(app).get('/api/v1/users/9999999');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/v1/users/me', () => {
  test('deletes own account', async () => {
    const { rows } = await pool.query(
      `INSERT INTO users (google_id, name, email)
       VALUES ('del_usr_g','Delete Me','del_usr@test.com')
       ON CONFLICT (email) DO UPDATE SET name='Delete Me' RETURNING id`
    );
    const delToken = signAccess({ userId: rows[0].id, email: 'del_usr@test.com' });

    const res = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${delToken}`);
    expect(res.status).toBe(200);

    const { rows: check } = await pool.query('SELECT id FROM users WHERE id = $1', [rows[0].id]);
    expect(check.length).toBe(0);
  });
});
