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

describe('PUT /api/users/me', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).put('/api/users/me').send({ name: 'Alice' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when no valid fields are provided', async () => {
    const token = makeToken({ id: 'uuid-1' });
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ unknown_field: 'value' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 404 when user not found', async () => {
    userModel.updateById.mockResolvedValue(null);
    const token = makeToken({ id: 'uuid-missing' });
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('updates allowed fields and returns updated user', async () => {
    const updated = { id: 'uuid-1', name: 'Bob', bio: 'Hello', skills: ['JS', 'Go'], photo_url: 'http://img.test/a.png' };
    userModel.updateById.mockResolvedValue(updated);
    const token = makeToken({ id: 'uuid-1' });
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bob', bio: 'Hello', skills: ['JS', 'Go'], photo_url: 'http://img.test/a.png', google_id: 'should-be-ignored' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
    // google_id must not be in the update call
    const callArg = userModel.updateById.mock.calls[0][1];
    expect(callArg).not.toHaveProperty('google_id');
    expect(callArg).toHaveProperty('name', 'Bob');
  });
});
