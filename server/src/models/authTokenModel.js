const { getOne, insert, remove, query } = require('./base');

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

const revokeRefreshToken = (token) => remove('auth_tokens', 'token', token);

const deleteExpiredRefreshTokens = async () => {
  const { rowCount } = await query('DELETE FROM auth_tokens WHERE expires_at <= NOW()');
  return rowCount;
};

module.exports = {
  createRefreshToken,
  findUserByValidRefreshToken,
  revokeRefreshToken,
  deleteExpiredRefreshTokens,
};
