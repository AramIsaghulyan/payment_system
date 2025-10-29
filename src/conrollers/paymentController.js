const express = require('express');
const paymentService = require('../services/paymentService');
const authMiddleware = require('../middlewares/authMiddleware');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../utils/validation');
const accountValidation = require('../validations/paymentValidation');
const Response = require('../utils/response');

const router = express.Router();

router.post(
  '/transfer',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const { senderCardNumber, receiverCardNumber, amount } = await validate(req.body, accountValidation.transfer);
      const result = await paymentService.transfer(userId, senderCardNumber, receiverCardNumber, amount);
      return res.status(200).json(new Response(result));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

module.exports = router;
