const redis = require('redis');
require('dotenv').config({ quiet: true });

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
});

async function connectRedis() {
  try {
    await client.connect();
    console.log('Connected to Redis.');
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
}

module.exports = { client, connectRedis };