const express = require('express');
const paymentService = require('../services/paymentService');
const authMiddleware = require('../middlewares/authMiddleware');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../configs/joi');
const paymentValidation = require('../validations/paymentValidation');
const Response = require('../utils/response');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  requestMiddleware (async (req, res) => {
  try {
    const { userId } = req.user;
    const { accountId } = await validate(req.body, paymentValidation.findByAccountId);
    const result = await paymentService.findByAccountId(userId, accountId);
    return res.status(200).json(new Response(result));
  } catch (error) {
    return res.status(400).json(new Response({}, error));
  }
}));

router.post(
  '/transfer',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const { senderCardNumber, receiverCardNumber, amount } = await validate(req.body, paymentValidation.transfer);
      const result = await paymentService.transfer(userId, senderCardNumber, receiverCardNumber, amount);
      return res.status(200).json(new Response(result));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

router.post(
  '/deposit',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const { amount } = await validate(req.body, paymentValidation.deposit);
      const result = await paymentService.deposit(userId, amount);
      return res.status(200).json(new Response(result));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

router.post(
  '/withdraw',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const { amount } = await validate(req.body, paymentValidation.withdraw);
      const result = await paymentService.withdraw(userId, amount);
      return res.status(200).json(new Response(result));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

module.exports = router;
