const { pool } = require('../../configs/postgres');

// Get all users
async function findAll() {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY user_id');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
  return rows[0];
}

async function create(name, surname, email, password) {
  const sql = `
    INSERT INTO users (name, surname, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, name, surname, email, created_at
  `;
  const { rows } = await pool.query(sql, [name, surname, email, password]);
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

module.exports = { findAll, findById, create, findByEmail };
