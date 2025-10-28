const fs = require('fs');
const path = require('path');
const db = require('../configs/postgres');

async function dropDatabase() {
  const pool = db.getPool();
  try {
    const filePath = path.resolve(__dirname, '../database/schemes/dropDatabase.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log('Database schema dropped successfully.');
  } catch (err) {
    console.error('Error dropping database:', err.message);
  } finally {
    await db.close();
  }
}

dropDatabase();
