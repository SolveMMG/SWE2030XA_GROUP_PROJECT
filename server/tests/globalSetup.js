const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = async function () {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const dir = path.join(__dirname, '../src/db/migrations');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
    for (const f of files) {
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      await pool.query(sql).catch(() => {});
    }
  } finally {
    await pool.end();
  }
};
