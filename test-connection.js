const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.COCKROACHDB_URL,
  },
});

async function testConnection() {
  try {
    const result = await db.raw('SELECT version();');
    console.log('Koneksi berhasil ke database!');
    console.log('Versi PostgreSQL:', result.rows[0].version);
    await db.destroy();
  } catch (error) {
    console.error('❌ Koneksi database gagal:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
