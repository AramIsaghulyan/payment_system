const express = require('express');
const authService = require('../services/authService');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../configs/joi');
const authValidation = require('../validations/authValidation');
const Response = require('../utils/response');
const { StatusCodes } = require('http-status-codes');

const router = express.Router();

router.post(
  '/',
  requestMiddleware(async (req, res) => {
    try {
      const { email, password } = await validate(req.body, authValidation.login);
      const token = await authService.generateToken(email, password);
      return res.status(200).json(new Response(token));
    } catch (error) {
      if (error.message?.toLowerCase().includes('invalid')) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new Response({}, 'Invalid email or password'));
      }
      return res.status(StatusCodes.BAD_REQUEST).json(new Response({}, error));
    }
  })
);

module.exports = router;
