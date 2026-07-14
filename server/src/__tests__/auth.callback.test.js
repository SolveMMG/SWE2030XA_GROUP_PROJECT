const request = require('supertest');

jest.mock('../services/googleOAuth', () => ({
  exchangeCode: jest.fn(),
  fetchProfile: jest.fn(),
}));

const googleOAuth = require('../services/googleOAuth');
const app = require('../app');

describe('GET /auth/google/callback', () => {
  const originalConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/auth/google/callback';
  });

  afterAll(() => {
    process.env.GOOGLE_CLIENT_ID = originalConfig.clientId;
    process.env.GOOGLE_CLIENT_SECRET = originalConfig.clientSecret;
    process.env.GOOGLE_CALLBACK_URL = originalConfig.callbackUrl;
  });

  test('exchanges the code and returns the Google profile', async () => {
    googleOAuth.exchangeCode.mockResolvedValue({ access_token: 'google-access-token' });
    googleOAuth.fetchProfile.mockResolvedValue({
      id: 'google-123',
      email: 'alice@example.com',
      name: 'Alice Example',
      picture: 'https://example.com/alice.jpg',
      verified_email: true,
    });

    const res = await request(app).get('/auth/google/callback?code=google-code');

    expect(res.statusCode).toBe(200);
    expect(googleOAuth.exchangeCode).toHaveBeenCalledWith('google-code');
    expect(googleOAuth.fetchProfile).toHaveBeenCalledWith('google-access-token');
    expect(res.body).toEqual({
      googleProfile: {
        googleId: 'google-123',
        email: 'alice@example.com',
        name: 'Alice Example',
        photoUrl: 'https://example.com/alice.jpg',
        emailVerified: true,
      },
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
