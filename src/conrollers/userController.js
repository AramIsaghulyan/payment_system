const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;
    const user = await userService.createUser(name, surname, email, password);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
});

// router.get('/users', async (req, res) => {
//   try {
//     // 1️⃣ Check cache
//     const cache = await redisClient.get('customers');
//     if (cache) {
//       console.log('📦 Returned from Redis cache');
//       return res.json(JSON.parse(cache));
//     }

//     // 2️⃣ If not cached, query PostgreSQL
//     const result = await pool.query('SELECT * FROM customers;');
//     const users = result.rows;

//     // 3️⃣ Save to Redis for 30 seconds
//     await redisClient.setEx('customers', 30, JSON.stringify(users));

//     console.log('🧠 Returned from PostgreSQL and saved to cache');
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// });

module.exports = router;