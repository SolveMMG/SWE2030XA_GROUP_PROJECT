const { getOne, update, remove, query } = require('./base');

const findById = (id) =>
  getOne('SELECT * FROM users WHERE id = $1', [id]);

const findByGoogleId = (googleId) =>
  getOne('SELECT * FROM users WHERE google_id = $1', [googleId]);

const updateById = (id, data) =>
  update('users', { ...data, updated_at: new Date() }, 'id', id);

const deleteById = (id) =>
  remove('users', 'id', id);

const findPublicById = async (id) => {
  const { rows } = await query(
    `SELECT
       u.id,
       u.name,
       u.bio,
       u.skills,
       u.photo_url,
       u.created_at,
       ROUND(AVG(r.rating)::numeric, 2)  AS avg_rating,
       COUNT(r.id)::int                  AS review_count
     FROM users u
     LEFT JOIN reviews r ON r.reviewee_id = u.id
     WHERE u.id = $1
     GROUP BY u.id`,
    [id]
  );
  return rows[0] ?? null;
};

module.exports = { findById, findByGoogleId, updateById, deleteById, findPublicById };
