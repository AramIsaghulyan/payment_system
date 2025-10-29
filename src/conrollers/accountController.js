const express = require('express');
const accountService = require('../services/accountService');
const authMiddleware = require('../middlewares/authMiddleware');
const requestMiddleware = require('../middlewares/requestMiddleware');
const { validate } = require('../utils/validation');
const accountValidation = require('../validation/accountValidation');
const Response = require('../utils/response');

const router = express.Router();

router.post(
  '/:userId',
  authMiddleware,
  requestMiddleware(async (req, res) => {
    try {
      const { userId } = await validate(req.params, accountValidation.create);
      const user = await accountService.create(userId);
      return res.status(200).json(new Response(user));
    } catch (error) {
      return res.status(400).json(new Response({}, error));
    }
  })
);

module.exports = router;