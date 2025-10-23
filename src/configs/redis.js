const redis = require('redis');
require('dotenv').config({ quiet: true });

const client = redis.createClient({
  url: process.env.REDIS_URL
});

async function connectRedis() {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
    process.exit(1);
  }
}

module.exports = { client, connectRedis };