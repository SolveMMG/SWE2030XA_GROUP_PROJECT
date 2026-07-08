const { getOne, update, remove } = require('./base');

const findById = (id) =>
  getOne('SELECT * FROM users WHERE id = $1', [id]);

const findByGoogleId = (googleId) =>
  getOne('SELECT * FROM users WHERE google_id = $1', [googleId]);

const updateById = (id, data) =>
  update('users', { ...data, updated_at: new Date() }, 'id', id);

const deleteById = (id) =>
  remove('users', 'id', id);

module.exports = { findById, findByGoogleId, updateById, deleteById };
