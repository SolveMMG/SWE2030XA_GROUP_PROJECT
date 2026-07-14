const { Pool } = require('pg');

<<<<<<< HEAD
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
=======
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => {
  console.error('Unexpected DB pool error', err);
>>>>>>> 2eedb49 (feat: implement authentication and authorization middleware)
});

module.exports = pool;
