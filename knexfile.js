// Update with your config settings.
require('dotenv').config();
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

/**
* @type { import("knex").Knex.Config }
*/

module.exports = {
  client: 'mysql',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  },
  pool: { min: 0, max: 10 },
  seeds: {
    directory: './seeds',
  },
};
