const request = require('supertest');

jest.mock('../models/authTokenModel');

const authTokenModel = require('../models/authTokenModel');
const app = require('../app');

describe('POST /auth/logout', () => {
  beforeEach(() => jest.clearAllMocks());

  test('revokes the supplied refresh token', async () => {
    authTokenModel.revokeRefreshToken.mockResolvedValue(1);

    const res = await request(app)
      .post('/auth/logout')
      .send({ refreshToken: 'refresh-token-to-revoke' });

    expect(res.statusCode).toBe(204);
    expect(authTokenModel.revokeRefreshToken).toHaveBeenCalledWith('refresh-token-to-revoke');
  });

  test('requires a refresh token', async () => {
    const res = await request(app).post('/auth/logout').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('REFRESH_TOKEN_MISSING');
  });

  test('returns success when the token was already revoked or unknown', async () => {
    authTokenModel.revokeRefreshToken.mockResolvedValue(0);

    const res = await request(app)
      .post('/auth/logout')
      .send({ refreshToken: 'unknown-token' });

    expect(res.statusCode).toBe(204);
  });
});
