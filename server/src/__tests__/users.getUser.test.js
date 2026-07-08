const request = require('supertest');

jest.mock('../db/pool', () => ({ query: jest.fn(), on: jest.fn() }));
jest.mock('../models/userModel');

const userModel = require('../models/userModel');
const app = require('../app');

beforeEach(() => jest.clearAllMocks());

describe('GET /api/users/:id', () => {
  it('returns 404 when user does not exist', async () => {
    userModel.findPublicById.mockResolvedValue(null);
    const res = await request(app).get('/api/users/uuid-missing');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns public profile with avgRating and reviewCount', async () => {
    const profile = {
      id: 'uuid-1',
      name: 'Alice',
      bio: 'Developer',
      skills: ['JS', 'Python'],
      photo_url: null,
      created_at: '2026-01-01T00:00:00.000Z',
      avg_rating: '4.50',
      review_count: 2,
    };
    userModel.findPublicById.mockResolvedValue(profile);
    const res = await request(app).get('/api/users/uuid-1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(profile);
    expect(res.body).not.toHaveProperty('email');
    expect(res.body).not.toHaveProperty('google_id');
  });

  it('returns avgRating null and reviewCount 0 for user with no reviews', async () => {
    const profile = {
      id: 'uuid-2',
      name: 'Bob',
      bio: null,
      skills: [],
      photo_url: null,
      created_at: '2026-01-01T00:00:00.000Z',
      avg_rating: null,
      review_count: 0,
    };
    userModel.findPublicById.mockResolvedValue(profile);
    const res = await request(app).get('/api/users/uuid-2');
    expect(res.status).toBe(200);
    expect(res.body.avg_rating).toBeNull();
    expect(res.body.review_count).toBe(0);
  });

  it('/me route is not shadowed by /:id', async () => {
    // /me should still require auth, not be treated as an id lookup
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});
