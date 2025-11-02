const express = require('express');
const userService = require('../services/userService');
const authMiddleware = require('../middlewares/authMiddleware');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../configs/joi');
const userValidation = require('../validations/userValidation');
const Response = require('../utils/response');
const { StatusCodes } = require('http-status-codes');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await userService.findUserWithAccountsById(userId);
      return res.status(StatusCodes.OK).json(new Response(user));
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new Response({}, error));
    }
  })
);

router.post(
  '/',
  requestMiddleware(async (req, res) => {
    try {
      const { name, surname, email, password } = await validate(req.body, userValidation.create);
      const user = await userService.create(name, surname, email, password);
      return res.status(StatusCodes.CREATED).json(new Response(user));
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(new Response({}, error));
    }
  })
);

router.patch(
  '/',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId, email } = req.user;
      const fields = await validate(req.body, userValidation.update);
      const user = await userService.update(userId, email, fields);
      return res.status(StatusCodes.OK).json(new Response(user));
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json(new Response({}, error));
    }
  })
);

module.exports = router;
