const pool = require('../db/pool');

/**
 * Run a raw SQL query against the pool.
 * @param {string} text   - SQL string with $1, $2 … placeholders
 * @param {Array}  params - parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Return the first matching row, or null.
 * @param {string} text
 * @param {Array}  params
 * @returns {Promise<Object|null>}
 */
const getOne = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows[0] ?? null;
};

/**
 * Return all matching rows.
 * @param {string} text
 * @param {Array}  params
 * @returns {Promise<Object[]>}
 */
const getMany = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows;
};

/**
 * Insert one row into `table` using a plain object of column→value pairs.
 * Returns the inserted row.
 * @param {string} table
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const cols = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const text = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(text, values);
  return rows[0];
};

/**
 * Update columns on `table` where `whereCol` = `whereVal`.
 * Returns the updated row, or null if no row matched.
 * @param {string} table
 * @param {Object} data        - columns to update
 * @param {string} whereCol    - filter column name
 * @param {*}      whereVal    - filter value
 * @returns {Promise<Object|null>}
 */
const update = async (table, data, whereCol, whereVal) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const text = `UPDATE ${table} SET ${setClauses} WHERE ${whereCol} = $${keys.length + 1} RETURNING *`;
  const { rows } = await pool.query(text, [...values, whereVal]);
  return rows[0] ?? null;
};

/**
 * Delete rows from `table` where `whereCol` = `whereVal`.
 * Returns the number of rows deleted.
 * @param {string} table
 * @param {string} whereCol
 * @param {*}      whereVal
 * @returns {Promise<number>}
 */
const remove = async (table, whereCol, whereVal) => {
  const text = `DELETE FROM ${table} WHERE ${whereCol} = $1`;
  const { rowCount } = await pool.query(text, [whereVal]);
  return rowCount;
};

module.exports = { query, getOne, getMany, insert, update, remove };
