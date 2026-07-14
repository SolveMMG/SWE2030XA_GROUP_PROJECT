const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../db/pool', () => ({ query: jest.fn(), on: jest.fn() }));
jest.mock('../models/userModel');

const userModel = require('../models/userModel');
const app = require('../app');

const JWT_SECRET = 'test-secret';
const makeToken = (payload) => jwt.sign(payload, JWT_SECRET);

beforeAll(() => { process.env.JWT_SECRET = JWT_SECRET; });
beforeEach(() => jest.clearAllMocks());

describe('PUT /api/users/me — validation', () => {
  const token = () => makeToken({ id: 'uuid-1' });

  it('rejects blank name', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token()}`)
      .send({ name: '   ' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].field).toBe('name');
  });

  it('rejects name longer than 255 chars', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token()}`)
      .send({ name: 'a'.repeat(256) });
    expect(res.status).toBe(422);
  });

  it('rejects skills that is not an array', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token()}`)
      .send({ skills: 'JavaScript' });
    expect(res.status).toBe(422);
    expect(res.body.error.details[0].field).toBe('skills');
  });

  it('rejects a non-URL photo_url', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token()}`)
      .send({ photo_url: 'not-a-url' });
    expect(res.status).toBe(422);
    expect(res.body.error.details[0].field).toBe('photo_url');
  });

  it('accepts valid payload and calls controller', async () => {
    const updated = { id: 'uuid-1', name: 'Alice', bio: 'Hi', skills: ['JS'], photo_url: null };
    userModel.updateById.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token()}`)
      .send({ name: 'Alice', bio: 'Hi', skills: ['JS'] });
    expect(res.status).toBe(200);
  });

  it('accepts null bio and null photo_url', async () => {
    const updated = { id: 'uuid-1', name: 'Alice', bio: null, skills: [], photo_url: null };
    userModel.updateById.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token()}`)
      .send({ bio: null, photo_url: null });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/users/:id — validation', () => {
  it('returns 422 for non-UUID id', async () => {
    const res = await request(app).get('/api/users/not-a-uuid');
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].field).toBe('id');
  });

  it('passes validation for a valid UUID', async () => {
    userModel.findPublicById.mockResolvedValue(null);
    const res = await request(app).get('/api/users/550e8400-e29b-41d4-a716-446655440000');
    expect(res.status).toBe(404);
  });
});
