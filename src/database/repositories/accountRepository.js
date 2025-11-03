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
      const { rows: [account] } = await this.pool.query(insertAccount, [userId, cardNumber]);
      return account;
    } catch (error) {
      console.error('DB error in create account:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async verifyCardNumber(userId, cardNumber) {
    try {
      const query = `
        SELECT account_id AS "accountId"
        FROM accounts
        WHERE user_id = $1 AND card_number IN ($2);
      `;
      const { rows } = await this.pool.query(query, [userId, cardNumber]);
      return rows[0];
    } catch (error) {
      console.error('DB error in verify account:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async isValidCardNumber(cardNumber) {
    try {
      const query = `
        SELECT account_id AS "accountId"
        FROM accounts
        WHERE card_number IN ($1);
      `;
      const { rows } = await this.pool.query(query, [cardNumber]);
      return rows[0];
    } catch (error) {
      console.error('DB error in valid card number:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      const query = `
        SElECT 
          account_id AS "accountId",
          card_number AS "cardNumber",
          currency,
          balance
        FROM accounts
        WHERE user_id = $1;
      `;
      const { rows } = await this.pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('DB error in find by user Id:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

module.exports = new AccountRepository();
