// conn.js

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.COCKROACHDB_URL;
  const pool = new Pool({
    connectionString,
    application_name: "$ be_fuel",
  });

// const pool = new Pool({
//   user: process.env.DB_USERNAME,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;