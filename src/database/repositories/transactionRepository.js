const db = require('../../configs/postgres');

class TransactionRepository {
  constructor() {
    this.pool = db.getPool();
  }

  async transfer(senderAccountId, receiverAccountId, amount) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const selectQuery = `
        SELECT account_id, balance
        FROM accounts
        WHERE account_id IN ($1, $2)
        FOR UPDATE
      `;
      const { rows: accounts } = await client.query(selectQuery, [senderAccountId, receiverAccountId]);
      if (accounts.length !== 2) {
        throw new Error('Accounts not found');
      }
      const sender = accounts.find((a) => a.account_id === senderAccountId);
      if (sender.balance < amount) {
        throw new Error('Insufficient funds');
      }
      const updateQuerySender = `
        UPDATE accounts
        SET balance = balance - $1
        WHERE account_id = $2
      `;
      await client.query(updateQuerySender, [amount, senderAccountId]);
      const updateQueryReceiver = `
        UPDATE accounts
        SET balance = balance + $1
        WHERE account_id = $2
      `;
      await client.query(updateQueryReceiver, [amount, receiverAccountId]);
      const debitQuery = `
        INSERT INTO transactions (account_id, type, amount, direction, message)
        VALUES ($1, 'transfer', $2, 'debit', $3)
        RETURNING transaction_id
      `;
      // prettier-ignore
      const { rows: [debitTx] } = await client.query(debitQuery,[ 
        senderAccountId,
        amount,
        `Sent ${amount} USD to account ${receiverAccountId}`
      ]);

      const creditSql = `
        INSERT INTO transactions (account_id, type, amount, direction, reference_id, message)
        VALUES ($1, 'transfer', $2, 'credit', $3, $4)
        RETURNING transaction_id
      `;
      // prettier-ignore
      const { rows: [creditTx] } = await client.query(creditSql, [
        receiverAccountId,
        amount,
        debitTx.transaction_id,
        `Received ${amount} USD from account ${senderAccountId}`
      ]);

      await client.query('COMMIT');

      return {
        status: 'success',
        debitTx,
        creditTx,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Transfer failed:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  async deposit(accountId, amount) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('UPDATE accounts SET balance = balance + $1 WHERE account_id = $2', [amount, accountId]);
      const {
        rows: [tx],
      } = await client.query(
        `
        INSERT INTO transactions (account_id, type, amount, direction, message)
        VALUES ($1, 'deposit', $2, 'credit', $3)
        RETURNING transaction_id
        `,
        [accountId, amount, `Deposit ${amount} USD`]
      );

      await client.query('COMMIT');
      return tx;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async withdraw(accountId, amount) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const {
        rows: [account],
      } = await client.query('SELECT balance FROM accounts WHERE account_id = $1 FOR UPDATE', [accountId]);
      if (!account) throw new Error('Account not found');
      if (account.balance < amount) throw new Error('Insufficient funds');

      await client.query('UPDATE accounts SET balance = balance - $1 WHERE account_id = $2', [amount, accountId]);
      const {
        rows: [tx],
      } = await client.query(
        `
        INSERT INTO transactions (account_id, type, amount, direction, message)
        VALUES ($1, 'withdraw', $2, 'debit', $3)
        RETURNING transaction_id
        `,
        [accountId, amount, `Withdraw ${amount} USD`]
      );

      await client.query('COMMIT');
      return tx;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new TransactionRepository();
