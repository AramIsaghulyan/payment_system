const { Joi } = require('../configs/joi');

module.exports = {
  findByAccountId: {
    accountId: Joi.number().required(),
  },
  transfer: {
    senderCardNumber: Joi.string().required(),
    receiverCardNumber: Joi.string().required(),
    amount: Joi.number().required(),
  },
  deposit: {
    cardNumber: Joi.string().required(),
    amount: Joi.number().required(),
  },
  withdraw: {
    cardNumber: Joi.string().required(),
    amount: Joi.number().required(),
  },
};
