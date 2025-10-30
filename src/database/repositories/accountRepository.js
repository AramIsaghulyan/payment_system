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
      console.error('DB error in create account:', err.message);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async verifySenderAccount(userId, cardNumber) {
    try {
      const query = `
      SELECT account_id AS "accountId"
      FROM accounts
      WHERE user_id = $1 AND card_number = $2;
    `;
      const { rows: [account] } = await this.pool.query(query, [userId, cardNumber]);
      return account;
    } catch (error) {
      console.error('DB error in verify sender account:', err.message);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async isValidCardNumber(cardNumber) {
    try {
      const query = `
      SELECT account_id AS "accountId"
      FROM accounts
      WHERE card_number IN ($1);
    `;
      const { rows: [account] } = await this.pool.query(query, [cardNumber]);
      return account;
    } catch (error) {
      console.error('DB error in valid card number:', err.message);
      throw new Error(`Database error: ${err.message}`);
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
      const { rows: [account] } = await this.pool.query(query, [userId]);
      return account;
    } catch (error) {
      console.error('DB error in find by user Id:', err.message);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = new AccountRepository();
