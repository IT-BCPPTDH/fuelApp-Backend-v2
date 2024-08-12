// conn.js

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.COCKROACHDB_URL;
  const pool = new Pool({
    connectionString,
    application_name: "$ be_fuel",
  });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;