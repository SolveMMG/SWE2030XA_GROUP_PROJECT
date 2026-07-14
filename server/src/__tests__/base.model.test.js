jest.mock('../db/pool', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const pool = require('../db/pool');
const { getOne, getMany, insert, update, remove } = require('../models/base');

beforeEach(() => pool.query.mockReset());

describe('getOne', () => {
  it('returns first row when found', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: '1', name: 'Alice' }] });
    const result = await getOne('SELECT * FROM users WHERE id = $1', ['1']);
    expect(result).toEqual({ id: '1', name: 'Alice' });
  });

  it('returns null when no row found', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const result = await getOne('SELECT * FROM users WHERE id = $1', ['99']);
    expect(result).toBeNull();
  });
});

describe('getMany', () => {
  it('returns all rows', async () => {
    const rows = [{ id: '1' }, { id: '2' }];
    pool.query.mockResolvedValue({ rows });
    const result = await getMany('SELECT * FROM users', []);
    expect(result).toEqual(rows);
  });
});

describe('insert', () => {
  it('builds correct INSERT and returns inserted row', async () => {
    const row = { id: 'abc', name: 'Bob' };
    pool.query.mockResolvedValue({ rows: [row] });
    const result = await insert('users', { name: 'Bob' });
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      ['Bob']
    );
    expect(result).toEqual(row);
  });
});

describe('update', () => {
  it('builds correct UPDATE and returns updated row', async () => {
    const row = { id: '1', name: 'Charlie' };
    pool.query.mockResolvedValue({ rows: [row] });
    const result = await update('users', { name: 'Charlie' }, 'id', '1');
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
      ['Charlie', '1']
    );
    expect(result).toEqual(row);
  });

  it('returns null when no row matched', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const result = await update('users', { name: 'X' }, 'id', 'missing');
    expect(result).toBeNull();
  });
});

describe('remove', () => {
  it('returns rowCount of deleted rows', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });
    const count = await remove('users', 'id', '1');
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['1']);
    expect(count).toBe(1);
  });
});
