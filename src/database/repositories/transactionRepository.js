const db = require('../../configs/postgres');
const { client: redisClient } = require('../../configs/redis');
const { REDIS_TTL } = require('../../utils/constants');

class TransactionRepository {
  constructor() {
    this.pool = db.getPool();
  }

  async findByAccountId(accountId) {
    const redisKey = `account:${accountId}`;
    const cachedData = await redisClient.get(redisKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const query = `
      SELECT 
        transaction_id,
        account_id,
        type,
        amount,
        direction,
        status,
        message,
        created_at
      FROM transactions
      WHERE account_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await this.pool.query(query, [accountId]);
    await redisClient.set(redisKey, JSON.stringify(rows), { EX: REDIS_TTL });
    return rows;
  }

  async transfer(senderAccountId, receiverAccountId, amount) {
    const client = await this.pool.connect();
    let debitTx;
    let creditTx;
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
      debitTx = await this._createTransaction(client, {
        accountId: senderAccountId,
        senderAccountId,
        receiverAccountId,
        amount,
        type: 'transfer',
        direction: 'debit',
        status: 'pending',
      });
      creditTx = await this._createTransaction(client, {
        accountId: receiverAccountId,
        senderAccountId,
        receiverAccountId,
        amount,
        type: 'transfer',
        direction: 'credit',
        referenceId: debitTx.transaction_id,
        status: 'pending',
      });
      await this._updateBalance(client, senderAccountId, amount, 'debit');
      await this._updateBalance(client, receiverAccountId, amount, 'credit');
      await this._updateTxStatus(client, {
        transactionId: debitTx.transaction_id,
        senderAccountId,
        receiverAccountId,
        amount,
        status: 'success',
        direction: 'debit',
      });
      await this._updateTxStatus(client, {
        transactionId: creditTx.transaction_id,
        senderAccountId,
        receiverAccountId,
        amount,
        status: 'success',
        direction: 'credit',
      });
      await client.query('COMMIT');

      return {
        status: 'success',
        debitTx,
        creditTx,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transfer failed:', error.message);
      if (debitTx?.transaction_id) {
        await this._updateTxStatus(this.pool, { transactionId: debitTx.transaction_id, status: 'failed', errorMessage: error.message });
      }
      if (creditTx?.transaction_id) {
        await this._updateTxStatus(this.pool, { transactionId: creditTx.transaction_id, status: 'failed', errorMessage: error.message });
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async deposit(accountId, amount) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this._updateBalance(client, accountId, amount, 'credit');
      const tx = await this._createTransaction(client, { accountId, amount, type: 'deposit', direction: 'credit', status: 'success' });
      await client.query('COMMIT');
      return tx;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Deposit failed:', error.message);
      await this._createTransaction(this.pool, { accountId, amount, type: 'deposit', direction: 'credit', status: 'failed' });
      throw error;
    } finally {
      client.release();
    }
  }

  async withdraw(accountId, amount) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const selectBalanceQuery = `
        SELECT balance
        FROM accounts
        WHERE account_id = $1 FOR UPDATE
      `;
      // prettier-ignore
      const { rows: [account] } = await client.query(selectBalanceQuery, [accountId]);
      if (!account) {
        throw new Error('Account not found');
      }
      if (account.balance < amount) {
        throw new Error('Insufficient funds');
      }
      await this._updateBalance(client, accountId, amount, 'debit');
      const tx = await this._createTransaction(client, { accountId, amount, type: 'withdraw', direction: 'debit', status: 'success' });
      await client.query('COMMIT');
      return tx;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Withdraw failed:', error.message);
      await this._createTransaction(this.pool, { accountId, amount, type: 'withdraw', direction: 'debit', status: 'failed' });
      throw error;
    } finally {
      client.release();
    }
  }

  async _createTransaction(clientOrPool, { accountId, senderAccountId, receiverAccountId, amount, type, direction, status, referenceId }) {
    let message;
    if (type === 'transfer') {
      message =
        direction === 'debit'
          ? `Preparing to send ${amount} USD to account ${receiverAccountId}`
          : `Preparing to receive ${amount} USD from account ${senderAccountId}`;
    } else if (type === 'deposit') {
      message = `Deposit ${amount} USD`;
    } else if (type === 'withdraw') {
      message = `Withdraw ${amount} USD`;
    } else {
      throw new Error(`Unsupported transaction type: ${type}`);
    }

    const sql = `
      INSERT INTO transactions 
      (account_id, type, amount, direction, reference_id, status, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING transaction_id
    `;
    // prettier-ignore
    const { rows: [tx] } = await clientOrPool.query(sql, [accountId, type, amount, direction, referenceId, status, message]);
    return tx;
  }

  async _updateTxStatus(client, { transactionId, senderAccountId, receiverAccountId, amount, status, direction, errorMessage = null }) {
    let message;
    if (status === 'success') {
      // prettier-ignore
      message = direction === 'debit'
        ? `Sent ${amount} USD to account ${receiverAccountId}`
        : `Received ${amount} USD from account ${senderAccountId}`;
    } else if (status === 'failed') {
      message = `Transfer failed: ${errorMessage || 'Unknown error'}`;
    } else {
      throw new Error(`Unsupported transaction status: ${status}`);
    }

    const query = `
      UPDATE transactions
      SET status = $1, message = $2
      WHERE transaction_id = $3
    `;
    await client.query(query, [status, message, transactionId]);
  }

  async _updateBalance(client, accountId, amount, operation) {
    const operator = operation === 'debit' ? '-' : '+';

    const query = `
    UPDATE accounts
    SET balance = balance ${operator} $1
    WHERE account_id = $2
  `;
    await client.query(query, [amount, accountId]);
  }
}

module.exports = new TransactionRepository();
