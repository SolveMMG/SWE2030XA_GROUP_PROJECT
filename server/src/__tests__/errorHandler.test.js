const request = require('supertest');
const express = require('express');
const errorHandler = require('../middleware/errorHandler');
const AppError = require('../utils/AppError');

// Minimal app that just throws errors through to the handler
const makeApp = (thrower) => {
  const app = express();
  app.get('/test', (_req, _res, next) => { try { thrower(); } catch (e) { next(e); } });
  app.use(errorHandler);
  return app;
};

describe('errorHandler', () => {
  it('returns structured JSON for AppError', async () => {
    const app = makeApp(() => { throw new AppError(409, 'CONFLICT', 'Already exists'); });
    const res = await request(app).get('/test');
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: 'CONFLICT', message: 'Already exists' } });
  });

  it('returns 500 INTERNAL_SERVER_ERROR for unexpected errors in dev', async () => {
    process.env.NODE_ENV = 'development';
    const app = makeApp(() => { throw new Error('DB exploded'); });
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(res.body.error.message).toBe('DB exploded');
  });

  it('hides error detail in production', async () => {
    process.env.NODE_ENV = 'production';
    const app = makeApp(() => { throw new Error('secret internal detail'); });
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe('An unexpected error occurred');
    expect(res.body.error.message).not.toContain('secret');
    process.env.NODE_ENV = 'test';
  });
});

describe('AppError', () => {
  it('sets status, code and message', () => {
    const err = new AppError(404, 'NOT_FOUND', 'Gone');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Gone');
    expect(err instanceof Error).toBe(true);
  });
});
