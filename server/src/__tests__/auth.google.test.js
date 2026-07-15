const request = require('supertest');
const app = require('../app');

describe('GET /auth/google', () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  const originalCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/auth/google/callback';
  });

  afterAll(() => {
    process.env.GOOGLE_CLIENT_ID = originalClientId;
    process.env.GOOGLE_CALLBACK_URL = originalCallbackUrl;
  });

  test('redirects to the Google OAuth authorization endpoint', async () => {
    const res = await request(app).get('/auth/google');
    const location = new URL(res.headers.location);

    expect(res.statusCode).toBe(302);
    expect(location.origin + location.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(location.searchParams.get('client_id')).toBe('test-google-client-id');
    expect(location.searchParams.get('redirect_uri')).toBe('http://localhost:5000/auth/google/callback');
    expect(location.searchParams.get('response_type')).toBe('code');
    expect(location.searchParams.get('scope')).toBe('openid email profile');
    expect(location.searchParams.get('access_type')).toBe('offline');
  });
});
