
require('dotenv').config();
const fs = require('fs');

module.exports = {
  client: 'cockroachdb',
  connection: {
    connectionString: process.env.COCKROACHDB_URL + "&application_name=docs_simplecrud_knex",
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
};