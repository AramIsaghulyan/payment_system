const { Pool } = require('pg');
require('dotenv').config({ quiet: true });

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  async connect() {
    try {
      await this.pool.query('SELECT 1');
      console.log('Connected to PostgreSQL');
    } catch (err) {
      console.error('PostgreSQL connection error:', err.message);
      process.exit(1);
    }
  }

  getPool() {
    return this.pool;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new Database();
