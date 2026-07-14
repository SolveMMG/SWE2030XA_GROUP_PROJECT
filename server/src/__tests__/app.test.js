const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const request = require('supertest');
const app = require('../app');

test('GET /api/health returns 200', async () => {
  const res = await request(app).get('/api/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
});
