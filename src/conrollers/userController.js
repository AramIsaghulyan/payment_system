const express = require('express');
const userService = require('../services/userService');
const authMiddleware = require('../middlewares/authMiddleware');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../utils/validation');
const userValidation = require('../validation/userValidation');
const Response = require('../utils/response');

const router = express.Router();

router.get(
  '/:userId',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = await validate(req.params, userValidation.findById);
      const user = await userService.findUserWithAccountsById(userId);
      return res.status(200).json(new Response(user));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

router.post(
  '/',
  requestMiddleware(async (req, res) => {
    try {
      const { name, surname, email, password } = await validate(req.body, userValidation.create);
      const user = await userService.create(name, surname, email, password);
      return res.status(200).json(new Response(user));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

router.patch(
  '/:userId',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      console.log(req.params)
      const reqData = { ...req.params, ...req.body };
      const validData = await validate(reqData, userValidation.update);
      const { userId, ...fields } = validData;
      const user = await userService.update(userId, fields);
      return res.status(200).json(new Response(user));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

module.exports = router;
