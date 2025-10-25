const express = require('express');
const authService = require('../services/authService');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../utils/validation');
const authValidation = require('../validation/authValidation');
const Response = require('../utils/response');

const router = express.Router();

router.post(
  '/',
  requestMiddleware(async (req, res) => {
    try {
      const { email, password } = await validate(req.body, authValidation.login);
      const token = await authService.generateToken(email, password);
      return res.status(200).json(new Response(token));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

module.exports = router;
