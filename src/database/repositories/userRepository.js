const bcrypt = require('bcrypt');
const db = require('../../configs/postgres');
const { buildUpdateQuery } = require('../../utils/functions');
const { PASSWORD_HASH_ROUNDS } = require('../../utils/constants');

class UserRepository {
  constructor() {
    this.pool = db.getPool();
  }

  generateSelectByAction(findBy) {
    const includePassword = findBy === 'user_id' ? ',' : ', u.password,';
    return `
      SELECT u.user_id, u.name, u.surname${includePassword} u.email,
        COALESCE(
          json_agg(
            json_build_object(
              'account_id', a.account_id,
              'card_number', a.card_number,
              'currency', a.currency,
              'balance', a.balance
            )
          ) FILTER (WHERE a.account_id IS NOT NULL), 
          '[]'
        ) AS accounts
      FROM users u
      LEFT JOIN accounts a ON u.user_id = a.user_id
      WHERE u.${findBy} = $1
      GROUP BY u.user_id, u.name, u.surname${includePassword} u.email;
    `;
  }

  async findUserWithAccountsById(id) {
  try {
    const query = this.generateSelectByAction('user_id');
    const { rows } = await this.pool.query(query, [id]);
    return rows[0];
  } catch (error) {
    console.error('DB error in find user by id:', error.message);
    throw new Error(`Database error: ${error.message}`);
  }
}


  async findByEmail(email) {
    try {
      const query = this.generateSelectByAction('email');
      console.log(query)
      const { rows } = await this.pool.query(query, [email]);
      return rows[0];
    } catch (error) {
      console.error('DB error in find user by email:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async create(name, surname, email, password) {
    const hashed = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    const client = await this.pool.connect();
    try {
      const insertUser = `
        INSERT INTO users (name, surname, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, name, surname, email;
      `;
      const { rows } = await client.query(insertUser, [name, surname, email, hashed]);
      delete user.password;
      return rows[0];
    } catch (error) {
      console.error('DB error in create user:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async update(userId, fields) {
    try {
      if (fields.password && fields.oldPassword) {
        const isMatch = await bcrypt.compare(fields.oldPassword, user.password);
        if (!isMatch) {
          throw new Error('Invalid old password');
        }
        const hashed = await bcrypt.hash(fields.password, PASSWORD_HASH_ROUNDS);
        fields.password = hashed;
        delete fields.oldPassword;
      }
      const { setClause, values } = buildUpdateQuery(fields);
      const sql = `
        UPDATE users
        SET ${setClause}
        WHERE user_id = $${values.length + 1}
        RETURNING user_id, name, surname, email;
      `;
      values.push(userId);
      const { rows } = await this.pool.query(sql, values);
      return rows[0];
    } catch (error) {
      console.error('DB error in update user:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

module.exports = new UserRepository();
