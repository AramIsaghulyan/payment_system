const db = require('../../configs/postgres');
const { generateCardNumber } = require('../../utils/functions');

class AccountRepository {
  constructor() {
    this.pool = db.getPool();
  }

  async create(user_id) {
    try {
      const client = await this.pool.connect();
      const cardNumber = generateCardNumber();
      const insertAccount = `
      INSERT INTO accounts (user_id, card_number)
      VALUES ($1, $2)
      RETURNING account_id, card_number, balance, currency;
    `;
      const { rows } = await client.query(insertAccount, [user_id, cardNumber]);
      return rows[0];
    } catch (error) {
      console.error('DB error in create account:', err.message);
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = new AccountRepository();
