const { getOne, insert } = require('./base');

const createRefreshToken = (userId, token, expiresAt) =>
  insert('auth_tokens', { user_id: userId, token, expires_at: expiresAt });

const findUserByValidRefreshToken = (token) =>
  getOne(
    `SELECT u.id, u.email
     FROM auth_tokens AS at
     INNER JOIN users AS u ON u.id = at.user_id
     WHERE at.token = $1 AND at.expires_at > NOW()`,
    [token],
  );

module.exports = { createRefreshToken, findUserByValidRefreshToken };
