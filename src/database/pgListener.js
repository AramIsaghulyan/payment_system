const { client: redisClient } = require('../configs/redis');
const db = require('../configs/postgres');

async function initPgListener() {
  const pool = db.getPool();
  const client = await pool.connect();

  try {
    await client.query('LISTEN transaction_changes');
    console.log('Listening for Postgres NOTIFY on "transaction_changes"...');
    client.on('notification', async (msg) => {
      try {
        const tx = JSON.parse(msg.payload);
        const key = `account:${tx.account_id}`;
        await redisClient.del(key);
      } catch (error) {
        console.error('Failed to process NOTIFY payload:', error.message);
      }
    });

    client.on('error', (error) => {
      console.error('Postgres listener error:', error.message);
    });
  } catch (error) {
    console.error('Failed to initialize Postgres listener:', error.message);
  }
}

module.exports = { initPgListener };
