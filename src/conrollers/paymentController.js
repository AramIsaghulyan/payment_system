const express = require('express');
const paymentService = require('../services/paymentService');
const authMiddleware = require('../middlewares/authMiddleware');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../configs/joi');
const paymentValidation = require('../validations/paymentValidation');
const Response = require('../utils/response');
const { StatusCodes } = require('http-status-codes');


const router = express.Router();

router.get(
  '/',
  authMiddleware,
  requestMiddleware (async (req, res) => {
  try {
    const { userId } = req.user;
    const { accountId } = await validate(req.body, paymentValidation.findByAccountId);
    const result = await paymentService.findByAccountId(userId, accountId);
    return res.status(StatusCodes.OK).json(new Response(result));
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new Response({}, error));
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
      return res.status(StatusCodes.OK).json(new Response(result));
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json(new Response({}, error));
    }
  })
);

router.post(
  '/deposit',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const { cardNumber, amount } = await validate(req.body, paymentValidation.deposit);
      const result = await paymentService.deposit(userId, cardNumber, amount);
      return res.status(StatusCodes.OK).json(new Response(result));
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json(new Response({}, error));
    }
  })
);

router.post(
  '/withdraw',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const { cardNumber, amount } = await validate(req.body, paymentValidation.withdraw);
      const result = await paymentService.withdraw(userId, cardNumber, amount);
      return res.status(StatusCodes.OK).json(new Response(result));
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json(new Response({}, error));
    }
  })
);

module.exports = router;
