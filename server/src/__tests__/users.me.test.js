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

describe('GET /api/users/me', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 for an invalid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer bad.token.here');
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found in DB', async () => {
    userModel.findById.mockResolvedValue(null);
    const token = makeToken({ id: 'uuid-1' });
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 200 with user profile when authenticated', async () => {
    const user = { id: 'uuid-1', name: 'Alice', email: 'alice@example.com', skills: ['JS'] };
    userModel.findById.mockResolvedValue(user);
    const token = makeToken({ id: 'uuid-1' });
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(user);
  });
});
