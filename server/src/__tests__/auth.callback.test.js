const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../services/googleOAuth', () => ({
  exchangeCode: jest.fn(),
  fetchProfile: jest.fn(),
}));
jest.mock('../models/userModel');
jest.mock('../models/authTokenModel');

const googleOAuth = require('../services/googleOAuth');
const userModel = require('../models/userModel');
const authTokenModel = require('../models/authTokenModel');
const app = require('../app');

describe('GET /auth/google/callback', () => {
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

  test('creates and returns a user on their first Google login', async () => {
    googleOAuth.exchangeCode.mockResolvedValue({ access_token: 'google-access-token' });
    googleOAuth.fetchProfile.mockResolvedValue({
      id: 'google-123',
      email: 'alice@example.com',
      name: 'Alice Example',
      picture: 'https://example.com/alice.jpg',
      verified_email: true,
    });
    userModel.findByGoogleId.mockResolvedValue(null);
    const user = { id: 'user-123', email: 'alice@example.com', name: 'Alice Example' };
    userModel.createFromGoogleProfile.mockResolvedValue(user);
    authTokenModel.createRefreshToken.mockResolvedValue({ id: 'auth-token-123' });

    const res = await request(app).get('/auth/google/callback?code=google-code');

    expect(res.statusCode).toBe(200);
    expect(googleOAuth.exchangeCode).toHaveBeenCalledWith('google-code');
    expect(googleOAuth.fetchProfile).toHaveBeenCalledWith('google-access-token');
    expect(userModel.findByGoogleId).toHaveBeenCalledWith('google-123');
    expect(userModel.createFromGoogleProfile).toHaveBeenCalledWith({
      googleId: 'google-123',
      email: 'alice@example.com',
      name: 'Alice Example',
      photoUrl: 'https://example.com/alice.jpg',
      emailVerified: true,
    });
    const tokenPayload = jwt.verify(res.body.accessToken, 'test-jwt-secret');
    expect(tokenPayload.userId).toBe('user-123');
    expect(tokenPayload.email).toBe('alice@example.com');
    expect(tokenPayload.exp - tokenPayload.iat).toBe(3600);
    expect(authTokenModel.createRefreshToken).toHaveBeenCalledWith(
      'user-123',
      expect.any(String),
      expect.any(Date),
    );
    expect(res.body).toMatchObject({
      user,
      tokenType: 'Bearer',
      expiresIn: 3600,
      refreshExpiresIn: 2592000,
    });
    expect(res.body.refreshToken).toMatch(/^[a-f0-9]{96}$/);
  });

  test('returns the existing user on a subsequent Google login', async () => {
    googleOAuth.exchangeCode.mockResolvedValue({ access_token: 'google-access-token' });
    googleOAuth.fetchProfile.mockResolvedValue({ id: 'google-123', email: 'alice@example.com' });
    const user = { id: 'user-123', email: 'alice@example.com', name: 'Alice' };
    userModel.findByGoogleId.mockResolvedValue(user);
    authTokenModel.createRefreshToken.mockResolvedValue({ id: 'auth-token-123' });

    const res = await request(app).get('/auth/google/callback?code=google-code');

    expect(res.statusCode).toBe(200);
    expect(userModel.createFromGoogleProfile).not.toHaveBeenCalled();
    expect(res.body).toMatchObject({
      user,
      tokenType: 'Bearer',
      expiresIn: 3600,
      refreshExpiresIn: 2592000,
    });
    expect(jwt.verify(res.body.accessToken, 'test-jwt-secret')).toMatchObject({
      userId: 'user-123',
      email: 'alice@example.com',
    });
  });

  test('rejects a callback without an authorization code', async () => {
    const res = await request(app).get('/auth/google/callback');

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('OAUTH_CODE_MISSING');
  });

  test('does not expose Google errors', async () => {
    googleOAuth.exchangeCode.mockRejectedValue(new Error('invalid_grant'));

    const res = await request(app).get('/auth/google/callback?code=bad-code');

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('OAUTH_AUTHENTICATION_FAILED');
    expect(res.body.error.message).toBe('Google authentication failed');
  });
});
