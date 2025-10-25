const { Joi } = require('../utils/validation');

module.exports = {
  create: {
    name: Joi.string().min(2).max(100).required(),
    surname: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.password().min(8).max(255).strong().required(),
  },
  findById: {
    id: Joi.number().required(),
  },
};
