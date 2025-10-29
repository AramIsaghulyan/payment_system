const { Joi } = require('../utils/validation');

module.exports = {
  transfer: {
    senderCardNumber: Joi.string().required(),
    receiverCardNumber: Joi.string().required(),
    amount: Joi.number().required()
  },
};
