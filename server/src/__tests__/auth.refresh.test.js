const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/authTokenModel');

const authTokenModel = require('../models/authTokenModel');
const app = require('../app');

describe('POST /auth/refresh', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => { process.env.JWT_SECRET = originalJwtSecret; });

  test('issues a new one-hour access token for a valid refresh token', async () => {
    authTokenModel.findUserByValidRefreshToken.mockResolvedValue({
      id: 'user-123',
      email: 'alice@example.com',
    });

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'valid-refresh-token' });

    expect(res.statusCode).toBe(200);
    expect(authTokenModel.findUserByValidRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    expect(res.body).toMatchObject({ tokenType: 'Bearer', expiresIn: 3600 });
    expect(jwt.verify(res.body.accessToken, 'test-jwt-secret')).toMatchObject({
      userId: 'user-123',
      email: 'alice@example.com',
    });
  });

  test('rejects a missing or invalid refresh token', async () => {
    const missing = await request(app).post('/auth/refresh').send({});
    expect(missing.statusCode).toBe(400);
    expect(missing.body.error.code).toBe('REFRESH_TOKEN_MISSING');

    authTokenModel.findUserByValidRefreshToken.mockResolvedValue(null);
    const invalid = await request(app).post('/auth/refresh').send({ refreshToken: 'invalid-token' });
    expect(invalid.statusCode).toBe(401);
    expect(invalid.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });
});
