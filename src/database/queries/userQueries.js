const { pool } = require('../../configs/postgres');
const { generateCardNumber } = require('../../utils/functions');

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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    const insertUser = `
      INSERT INTO users (name, surname, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, name, surname, email, created_at`;
    // prettier-ignore
    const { rows: [user] } = await pool.query(insertUser, [name, surname, email, password]);
    const cardNumber = generateCardNumber();

    const insertAccount = `
      INSERT INTO accounts (user_id, card_number)
      VALUES ($1, $2, $3, $4)
      RETURNING account_id, card_number, balance, currency;
    `;
    // prettier-ignore
    const { rows: [account] } = await client.query(insertAccount, [
      user.user_id,
      cardNumber,
    ]);

    await client.query('COMMIT');

    return {
      ...user,
      account,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

module.exports = { findAll, findById, create, findByEmail };
