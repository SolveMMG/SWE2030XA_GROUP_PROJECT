const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../services/googleOAuth', () => ({
  exchangeCode: jest.fn(),
  fetchProfile: jest.fn(),
}));
jest.mock('../models/authTokenModel');
jest.mock('../models/userModel');

const googleOAuth = require('../services/googleOAuth');
const authTokenModel = require('../models/authTokenModel');
const userModel = require('../models/userModel');
const app = require('../app');

const testUser = { id: 'user-123', email: 'alice@example.com', name: 'Alice Example' };

describe('authentication flow', () => {
  const originalConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    jwtSecret: process.env.JWT_SECRET,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/auth/google/callback';
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    process.env.GOOGLE_CLIENT_ID = originalConfig.clientId;
    process.env.GOOGLE_CLIENT_SECRET = originalConfig.clientSecret;
    process.env.GOOGLE_CALLBACK_URL = originalConfig.callbackUrl;
    process.env.JWT_SECRET = originalConfig.jwtSecret;
  });

  test('logs in through Google and returns access and refresh tokens', async () => {
    googleOAuth.exchangeCode.mockResolvedValue({ access_token: 'google-access-token' });
    googleOAuth.fetchProfile.mockResolvedValue({
      id: 'google-123',
      email: 'alice@example.com',
      name: 'Alice Example',
      verified_email: true,
    });
    userModel.findByGoogleId.mockResolvedValue(testUser);
    authTokenModel.deleteExpiredRefreshTokens.mockResolvedValue(0);
    authTokenModel.createRefreshToken.mockResolvedValue({ id: 'stored-token-123' });

    const res = await request(app).get('/auth/google/callback?code=google-code');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      user: testUser,
      tokenType: 'Bearer',
      expiresIn: 3600,
      refreshExpiresIn: 2592000,
    });
    expect(res.body.refreshToken).toMatch(/^[a-f0-9]{96}$/);
    expect(jwt.verify(res.body.accessToken, 'test-jwt-secret')).toMatchObject({
      userId: testUser.id,
      email: testUser.email,
    });
  });

  test('refreshes an access token', async () => {
    authTokenModel.findUserByValidRefreshToken.mockResolvedValue(testUser);

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'valid-refresh-token' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ tokenType: 'Bearer', expiresIn: 3600 });
    expect(jwt.verify(res.body.accessToken, 'test-jwt-secret')).toMatchObject({
      userId: testUser.id,
      email: testUser.email,
    });
  });

  test('revokes a refresh token on logout', async () => {
    authTokenModel.revokeRefreshToken.mockResolvedValue(1);

    const res = await request(app)
      .post('/auth/logout')
      .send({ refreshToken: 'valid-refresh-token' });

    expect(res.statusCode).toBe(204);
    expect(authTokenModel.revokeRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
  });

  test('allows a valid access token on a protected route', async () => {
    userModel.findById.mockResolvedValue(testUser);
    const accessToken = jwt.sign(
      { userId: testUser.id, email: testUser.email },
      'test-jwt-secret',
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(testUser);
    expect(userModel.findById).toHaveBeenCalledWith(testUser.id);
  });
});
