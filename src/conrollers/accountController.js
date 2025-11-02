const express = require('express');
const accountService = require('../services/accountService');
const authMiddleware = require('../middlewares/authMiddleware');
const requestMiddleware = require('../middlewares/requestMiddleware');
const Response = require('../utils/response');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await accountService.create(userId);
      return res.status(200).json(new Response(user));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

router.post(
  '/',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await accountService.create(userId);
      return res.status(200).json(new Response(user));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

module.exports = router;
