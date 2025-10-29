const db = require('../../configs/postgres');
const { generateCardNumber } = require('../../utils/functions');

class AccountRepository {
  constructor() {
    this.pool = db.getPool();
  }

  async create(userId) {
    try {
      const cardNumber = generateCardNumber();
      const insertAccount = `
      INSERT INTO accounts (user_id, card_number)
      VALUES ($1, $2)
      RETURNING account_id, card_number, balance, currency;
    `;
      const { rows } = await this.pool.query(insertAccount, [userId, cardNumber]);
      return rows[0];
    } catch (error) {
      console.error('DB error in create account:', err.message);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async verifySenderAccount(userId, cardNumber) {
    try {
      const query = `
      SELECT account_id
      FROM accounts a
      WHERE a.user_id = $1 AND a.card_number = $2;
    `;
      const { rows } = await this.pool.query(query, [userId, cardNumber]);
      return rows[0];
    } catch (error) {
      console.error('DB error in verifySenderAccount:', err.message);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async isValidCardNumber(cardNumber) {
    try {
      const query = `
      SELECT account_id
      FROM accounts a
      WHERE card_number IN ($1);
    `;
      const { rows } = await this.pool.query(query, [cardNumber]);
      return rows[0];
    } catch (error) {
      console.error('DB error in verifySenderAccount:', err.message);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = new AccountRepository();
