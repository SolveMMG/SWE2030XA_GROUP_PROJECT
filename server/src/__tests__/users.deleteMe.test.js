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

describe('DELETE /api/users/me', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).delete('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns 404 when user does not exist', async () => {
    userModel.deleteById.mockResolvedValue(0);
    const token = makeToken({ id: 'uuid-missing' });
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 204 and no body on successful deletion', async () => {
    userModel.deleteById.mockResolvedValue(1);
    const token = makeToken({ id: 'uuid-1' });
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(userModel.deleteById).toHaveBeenCalledWith('uuid-1');
  });
});
