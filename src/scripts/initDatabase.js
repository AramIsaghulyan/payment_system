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

async function initDatabase() {
  const sqlDir = path.resolve(__dirname, '../database/schemes');
  const files = fs.readdirSync(sqlDir).filter((file) => file.endsWith('.sql'));
  for (const file of files) {
    const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    await pool.query(sql);
  }
  await pool.end();
  console.log('All schemas initialized successfully.');
}

initDatabase();
