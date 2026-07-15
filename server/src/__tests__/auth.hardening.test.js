const request = require('supertest');
const app = require('../app');

describe('auth hardening', () => {
  test('sets Helmet security headers', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('limits repeated requests to auth routes', async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await request(app).get('/auth/google');
    }

    const res = await request(app).get('/auth/google');

    expect(res.statusCode).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});
