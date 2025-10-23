const { pool } = require('../../configs/database');

// Get all users
async function getAllUsers() {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
  return rows;
}

// Get user by ID
async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

// Insert new user
async function createUser(name, email, password) {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [name, email, password]);
  return rows[0];
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};