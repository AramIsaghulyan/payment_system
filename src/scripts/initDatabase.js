const fs = require('fs');
const path = require('path');
const db = require('../configs/postgres');

async function initDatabase() {
  const pool = db.getPool();
  try {
    const filePath = path.resolve(__dirname, '../database/schemes/initDatabase.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log('Database schema initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    await db.close();
  }
}

initDatabase();
