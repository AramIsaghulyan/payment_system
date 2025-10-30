const { Joi } = require('../configs/joi');

module.exports = {
  transfer: {
    senderCardNumber: Joi.string().required(),
    receiverCardNumber: Joi.string().required(),
    amount: Joi.number().required(),
  },
  deposit: {
    amount: Joi.number().required(),
  },
  withdraw: {
    amount: Joi.number().required(),
  },
};
