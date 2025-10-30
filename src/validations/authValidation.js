const { Joi } = require('../configs/joi');

module.exports = {
  login: {
    email: Joi.string().email().max(150).required(),
    password: Joi.string().min(8).max(255).required(),
  },
};
