const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function connectDatabase() {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  }
}

async function initDatabase() {
  const sqlDir = path.join(__dirname + '/../database/schemes');
  const files = ['userSchema.sql'];

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
      await pool.query(sql);
      console.log(`Executed ${file}`);
    }
    console.log('All schemas initialized successfully.');
  } catch (err) {
    console.error('Error initializing schemas:', err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

module.exports = { pool, connectDatabase, initDatabase };