const request = require('supertest');

jest.mock('../db/pool', () => ({ query: jest.fn(), on: jest.fn() }));
jest.mock('../models/userModel');

const userModel = require('../models/userModel');
const app = require('../app');

beforeEach(() => jest.clearAllMocks());

const ID_1 = '550e8400-e29b-41d4-a716-446655440001';
const ID_2 = '550e8400-e29b-41d4-a716-446655440002';
const ID_MISSING = '550e8400-e29b-41d4-a716-446655440099';

describe('GET /api/users/:id', () => {
  it('returns 404 when user does not exist', async () => {
    userModel.findPublicById.mockResolvedValue(null);
    const res = await request(app).get(`/api/users/${ID_MISSING}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns public profile with avgRating and reviewCount', async () => {
    const profile = {
      id: ID_1,
      name: 'Alice',
      bio: 'Developer',
      skills: ['JS', 'Python'],
      photo_url: null,
      created_at: '2026-01-01T00:00:00.000Z',
      avg_rating: '4.50',
      review_count: 2,
    };
    userModel.findPublicById.mockResolvedValue(profile);
    const res = await request(app).get(`/api/users/${ID_1}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(profile);
    expect(res.body).not.toHaveProperty('email');
    expect(res.body).not.toHaveProperty('google_id');
  });

  it('returns avgRating null and reviewCount 0 for user with no reviews', async () => {
    const profile = {
      id: ID_2,
      name: 'Bob',
      bio: null,
      skills: [],
      photo_url: null,
      created_at: '2026-01-01T00:00:00.000Z',
      avg_rating: null,
      review_count: 0,
    };
    userModel.findPublicById.mockResolvedValue(profile);
    const res = await request(app).get(`/api/users/${ID_2}`);
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
